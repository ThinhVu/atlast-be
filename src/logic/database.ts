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
  const password = v4().replaceAll('-', '')
  const doc: IDatabase = {
    userId,
    name: `${timestampId}${userId}`,
    username: timestampId,
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

export async function throwIfUserDoesNotOwnDb(userId: ObjectId, dbId: ObjectId) {
  const count = await Model.Database.countDocuments({_id: dbId, userId})
  if (count === 1) return true
  throw new Error("User doesn't own db")
}