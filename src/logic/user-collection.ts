import _ from 'lodash';
import {ObjectId} from "mongodb";
import {Model} from '../db/models';
// import uuid from 'time-uuid';
import {connectMongoClient} from "../plugins/mongodb";

let cache = new Set()

export async function connectDb(userId: ObjectId, dbId: ObjectId) {
  const {username, password, dbName} = await Model.Database.findOne({_id: dbId, userId: userId})
  const mongoClient = connectMongoClient({username, password, dbName, authSource: dbName})
  return mongoClient.db(dbName);
}

export async function createNewDoc(userId: ObjectId, dbId: ObjectId, colName: string, doc) {
  const db = await connectDb(userId, dbId);
  const collection = db.collection(colName);
  await collection.insertOne(doc)
  await getFieldNames(doc)
}

export async function deleteDoc(userId: ObjectId, dbId: ObjectId, colName: string, docId: ObjectId) {
  const db = await connectDb(userId, dbId);
  const collection = db.collection(colName);
  await collection.deleteOne({_id: docId})
}

export async function updateDoc(userId: ObjectId, dbId: ObjectId, colName: string, docId: ObjectId, doc) {
  const db = await connectDb(userId, dbId);
  const collection = db.collection(colName);
  await collection.updateOne({_id: docId}, {$set:doc})
  await getFieldNames(doc)
}

export async function getFieldNames(doc) {
  const fields = Object.keys(doc);
  fields.forEach(field => {
    if (!cache.has(field)) {
      cache.add(field);
    }
  });
  return fields
}

export async function getDocs(userId: ObjectId, dbId: ObjectId, colName: string, page: number) {
  const db = await connectDb(userId, dbId);
  const collection = db.collection(colName);
  const pageSize = 10;
  const skip = (page - 1) * pageSize;
  return collection.find().skip(skip).limit(pageSize).toArray();
}