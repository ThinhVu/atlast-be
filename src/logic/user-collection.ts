import {ObjectId} from "mongodb";
import {Model} from '../db/models';
import {connectMongoClient} from "../plugins/mongodb";
import {Db} from 'mongodb';
import dayjs from 'dayjs';

const dbCache = new Map<string, {db: Db, expireAt: Date}>();

export async function connectDb(userId: ObjectId, dbId: ObjectId) {
  const cacheKey = `${userId.toString()}_${dbId.toString()}`
  const cacheValue = dbCache.get(cacheKey);
  if (cacheValue && dayjs(cacheValue.expireAt).isAfter(dayjs()))
    return cacheValue.db
  const {username, password, dbName} = await Model.Database.findOne({_id: dbId, userId: userId});
  const mongoClient = connectMongoClient({username, password, dbName, authSource: dbName})
  const db = mongoClient.db(dbName)
  dbCache.set(cacheKey, { db, expireAt: dayjs().add(30, 'minutes').toDate()})
  return db;
}

export async function createDoc(userId: ObjectId, dbId: ObjectId, colName: string, doc: any) {
  const db = await connectDb(userId, dbId);
  const collection = db.collection(colName);
  return collection.insertOne(doc);
}

export async function updateDoc(userId: ObjectId, dbId: ObjectId, colName: string, docId: ObjectId, doc) {
  const db = await connectDb(userId, dbId);
  const collection = db.collection(colName);
  return collection.updateOne({_id: docId}, {$set:doc});
}

export async function deleteDoc(userId: ObjectId, dbId: ObjectId, colName: string, docId: ObjectId) {
  const db = await connectDb(userId, dbId);
  const collection = db.collection(colName);
  return collection.deleteOne({_id: docId})
}

export async function getDocs(userId: ObjectId ,dbId: ObjectId, colName: string, page: number) {
  const db = await connectDb(userId, dbId)
  const collection = db.collection(colName);
  const pageSize = 10;
  const skip = (page - 1) * pageSize;
  return collection.find().skip(skip).limit(pageSize).toArray();
}

export async function countDocs(userId: ObjectId, dbId: ObjectId, colName: string) {
  const db = await connectDb(userId, dbId);
  const collection = db.collection(colName);
  return collection.countDocuments();
}