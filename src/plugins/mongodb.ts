import {Collection, Db} from 'mongodb';
import {getClusterConnectionFactory} from "../logic/db-connection-factory";

let db: Db;

export function getColl<TSchema = any>(name: string): Collection<TSchema> {
  return db.collection<TSchema>(name)
}

export default async function mongodb() {
  console.log('[plugin] mongodb')
  try {
    const {DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME} = process.env;
    console.log(`[mongodb] Connecting to database ${DATABASE_NAME}`)
    const ccf = getClusterConnectionFactory(process.env.DATABASE_HOST)
    const client = ccf.connectMongoClient({
      username: DATABASE_USERNAME,
      password: encodeURIComponent(DATABASE_PASSWORD),
      dbName: DATABASE_NAME,
      dbHost: process.env.DATABASE_HOST,
      config: {
        authSource: 'admin',
        w: "majority",
        appName: "Cluster0",
        retryWrites: true
      }
    })
    db = client.db(DATABASE_NAME);
    console.log('[mongodb] Connected to server!')
  } catch (error) {
    console.error('[mongodb] Failed to connect. Reason:', error)
    process.exit(1)
  }
}
