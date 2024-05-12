import {Db, MongoClient} from "mongodb";

const ccfCache: Record<string, ClientConnection> = {}

export type ConnectClientConfig = {
  dbHost: string
  dbName: string,
  username?: string,
  password?: string,
  config?: Record<string, any>
}

export type ClientConnection = {
  connectMongoClient(ccc: ConnectClientConfig): MongoClient,
}

export function getClusterConnectionFactory(key: string) : ClientConnection {
  if (!ccfCache[key]) {
    let client: MongoClient;

    function connectMongoClient(clientConfig: ConnectClientConfig) {
      const {dbHost, dbName, username, password, config} = clientConfig;
      if (!dbHost) throw new Error("Missing DATABASE_HOST env variable")
      const configStr = Object.entries(config || {}).map(([k, v]) => `${k}=${v}`).join('&')
      const isSrvSupported = dbHost.indexOf('.mongodb.net') > 0
      const url = username
        ? `mongodb${isSrvSupported ? '+srv' : ''}://${username}:${password}@${dbHost}?${configStr}`
        : `mongodb://${dbHost}?authSource=${dbName}`;
      return new MongoClient(url);
    }

    ccfCache[key] = {connectMongoClient}
  }

  return ccfCache[key]
}