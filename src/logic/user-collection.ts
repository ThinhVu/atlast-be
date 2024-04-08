import {ObjectId} from "mongodb";
import {Model} from '../db/models';
import {connectMongoClient} from "../plugins/mongodb";
import {Db, MongoClient} from 'mongodb';

export async function connectDb(userId: ObjectId, dbId: ObjectId) {
  const {username, password, dbName} = await Model.Database.findOne({_id: dbId, userId: userId});
  const mongoClient = connectMongoClient({username, password, dbName, authSource: dbName})
  return mongoClient.db(dbName);
}

export async function createDoc(userId, dbId: ObjectId, colName: string, doc: any) {
  const db = await connectDb(userId, dbId);
  const collection = db.collection(colName);
  return await collection.insertOne(doc)
}

export async function updateDoc(userId: ObjectId, dbId: ObjectId, colName: string, docId: ObjectId, doc) {
  const db = await connectDb(userId, dbId);
  const collection = db.collection(colName);
  return await collection.updateOne({_id: docId}, {$set:doc})
}

export async function deleteDoc(userId: ObjectId, dbId: ObjectId, colName: string, docId: ObjectId) {
  const db = await connectDb(userId, dbId);
  const collection = db.collection(colName);
  await collection.deleteOne({_id: docId})
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