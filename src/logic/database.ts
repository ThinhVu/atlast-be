import {ObjectId} from "mongodb";
import {v4} from "uuid";
import {Model} from "../db/models";
import uuid from 'time-uuid';
import {IDatabase} from "../db/models/database";

export async function listDbs(userId: ObjectId) {
  return Model.Database.find({userId}).toArray()
}

export async function createDb(userId: ObjectId) {
  const timestampId = uuid()
  const username = `u${timestampId}`
  const password = v4()
  const doc: IDatabase = {
    userId,
    name: `${userId}_${timestampId}`,
    username,
    password,
    sizeInGB: 0,
    createDt: new Date()
  }
  const {insertedId} = await Model.Database.insertOne(doc)
  // TODO: create user for db

  doc._id = insertedId
  return doc;
}

export async function removeDb(userId: ObjectId, dbId: ObjectId) {
  return Model.Database.deleteOne({_id: dbId, userId})
}