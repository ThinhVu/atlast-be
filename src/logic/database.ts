import {ObjectId} from "mongodb";
import {v4} from "uuid";
import {Model} from "../db/models";
import uuid from 'time-uuid';
import {IDatabase} from "../db/models/database";
import {getDb} from "../plugins/mongodb";

export async function listDbs(userId: ObjectId) {
  return Model.Database.find({userId}).toArray()
}

export async function createDb(userId: ObjectId, name: string) {
  const timestampId = uuid()
  const password = v4().replaceAll('-', '')
  const createDt = new Date()
  const doc: IDatabase = {
    userId,
    name,
    dbName: `${timestampId}${userId}`,
    username: timestampId,
    password,
    sizeInGB: 0,
    createDt,
  }
  const {insertedId} = await Model.Database.insertOne(doc)
  try {
    const db = getDb(doc.dbName);
    await db.command({
      createUser: doc.username,
      pwd: doc.password,
      roles:[
        {role: "dbOwner", db: doc.dbName}
      ]
    })
    await db.createCollection('about');
    await db.collection('about').insertOne({name, createDt})
  } catch(e) {
    console.log('Fail to connect to new database',e)
  }
  doc._id = insertedId
  return doc;
}

export async function removeDb(userId: ObjectId, dbId: ObjectId) {
  const db = await Model.Database.findOne({_id: dbId}, {projection: {dbName: 1}});
  if (!db) throw new Error("User doesn't own db");
  await getDb(db.dbName).dropDatabase();
  return Model.Database.deleteOne({_id: dbId, userId})
}

export async function throwIfUserDoesNotOwnDb(userId: ObjectId, dbId: ObjectId) {
  const count = await Model.Database.countDocuments({_id: dbId, userId})
  if (count === 1) return true
  throw new Error("User doesn't own db")
}