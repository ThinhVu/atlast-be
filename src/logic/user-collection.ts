import {ObjectId} from "mongodb";
import {Model} from '../db/models';
import {connectMongoClient} from "../plugins/mongodb";
import {Db, MongoClient} from 'mongodb';

let db: Db
let client: MongoClient
let cache = new Set()

export async function connectDb(userId: ObjectId, dbId: ObjectId) {
  const {username, password, dbName} = await Model.Database.findOne({_id: dbId, userId: userId});
  const mongoClient = connectMongoClient({username, password, dbName, authSource: dbName})
  return mongoClient.db(dbName);
}


export async function createNewDoc(userId, dbId: ObjectId, colName: string, doc) {
  const db = await connectDb(userId, dbId);
  const collection = db.collection(colName);
  await collection.insertOne(doc)
  await getFieldNames(userId, dbId, colName, doc)
}

export async function deleteDoc(userId: ObjectId, dbId: ObjectId, colName: string, docId: ObjectId) {
  const db = await connectDb(userId, dbId);
  const collection = db.collection(colName);
  await collection.deleteOne({_id: docId})
}

export async function updateDoc(userId: ObjectId, dbId: ObjectId, colName: string, docId: ObjectId, doc) {
  await connectDb(userId, dbId);
  const collection = db.collection(colName);
  await collection.updateOne({_id: docId}, {$set:doc})
  await getFieldNames(userId, dbId, colName, doc)
}

export async function getFieldNames(userId: ObjectId, dbId: ObjectId, colName: string, doc) {
  Object.keys(doc).forEach(field => {
    if (!cache.has(field)) {
      cache.add(field);
    }
  });
  return cache
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