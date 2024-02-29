import {MongoClient, Db, Collection} from 'mongodb';
import {z} from "zod";

let client: MongoClient, db: Db;

export function getColl<TSchema = any>(name: string) : Collection<TSchema> {
   return db.collection<TSchema>(name)
}

async function connect() {
   try {
      const {
        DATABASE_HOST,
        DATABASE_USERNAME,
        DATABASE_PASSWORD,
        DATABASE_NAME,
      } = process.env;
      console.log(`[mongodb] Connecting to database ${DATABASE_NAME}`)
      const url = DATABASE_USERNAME
        ? `mongodb://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@${DATABASE_HOST}`
        : `mongodb://${DATABASE_HOST}`;
      client = new MongoClient(url);
      db = client.db(DATABASE_NAME);
      console.log('[mongodb] Connected to server!')
   } catch (error) {
      console.error('[mongodb] Failed to connect. Reason:', error)
      process.exit(1)
   }
}

export default async function mongodb() {
   console.log('[plugin] mongodb')
   await connect()
}
