import {MongoClient, Db, Collection} from 'mongodb';

let client: MongoClient, db: Db;

export function getColl<TSchema = any>(name: string) : Collection<TSchema> {
   return db.collection<TSchema>(name)
}
async function connect() {
   try {
      const {DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME} = process.env;
      const config = {
        username: DATABASE_USERNAME,
        password: encodeURIComponent(DATABASE_PASSWORD),
        dbName: DATABASE_NAME
      }
      console.log(`[mongodb] Connecting to database ${DATABASE_NAME}`)
      client = connectMongoClient(config);
      db = client.db(DATABASE_NAME);
      console.log('[mongodb] Connected to server!')
   } catch (error) {
      console.error('[mongodb] Failed to connect. Reason:', error)
      process.exit(1)
   }
}

export type ConnectClientConfig = {
  username?: string,
  password?: string,
  dbName: string,
}

export function connectMongoClient(config: ConnectClientConfig) {
  const dbHost = process.env.DATABASE_HOST
  if (!dbHost) throw new Error("Missing DATABASE_HOST env variable")
  const {username, password, dbName} = config;
  const dbHostContainsConfig = dbHost.indexOf('?')
  const url = username
    ? `mongodb://${username}:${password}@${dbHost}${dbHostContainsConfig ? '&' : '?'}authSource=admin`
    : `mongodb://${dbHost}?authSource=${dbName}`;
  client = new MongoClient(url);
  return client;
}

export function getDb(name: string) {
  if (!name) throw new Error("missing db name");
  return client.db(name);
}

export default async function mongodb() {
   console.log('[plugin] mongodb')
   await connect()
}
