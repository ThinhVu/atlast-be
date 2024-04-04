import _ from 'lodash';
import {ObjectId} from "mongodb";
import {Model} from '../db/models';
// import uuid from 'time-uuid';
import {connectMongoClient, getDb} from "../plugins/mongodb";
import {Db} from 'mongodb';

let db: Db
let cache = new Set()
let documents = []


export async function connectDb(userId: ObjectId, dbId: ObjectId) {
  const {username, password, dbName} = await Model.Database.findOne({_id: dbId, userId: userId})
  const mongoClient = connectMongoClient({username, password, dbName})
  db = mongoClient.db(dbName);
  return db
}

export async function createNewDoc(userId: ObjectId, dbId: ObjectId, colName: string, doc) {
  await connectDb(userId, dbId);
  const collection = db.collection(colName);
  await collection.insertOne(doc)
  await getFieldNames(doc)
}

export async function deleteDoc(userId: ObjectId, dbId: ObjectId, colName: string, docId: ObjectId) {
  await connectDb(userId, dbId);
  const collection = db.collection(colName);
  await collection.deleteOne({_id: docId})
}

export async function updateDoc(userId: ObjectId, dbId: ObjectId, colName: string, docId: ObjectId, doc) {
  await connectDb(userId, dbId);
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
  await connectDb(userId, dbId);
  const collection = db.collection(colName);
  const pageSize = 10;
  async function fetchPage(page) {
    const skip = (page - 1) * pageSize;
    documents = await collection.find().skip(skip).limit(pageSize).toArray();
    // documents = await collection.find().toArray()
    console.log(`docs: ${JSON.stringify(documents)}`)
    console.log(`Content of page ${page}:`, documents);
    if (documents.length === pageSize) {
      await fetchPage(page + 1);
    }
  }
  await fetchPage(page);
  return documents
}