import {ObjectId} from "mongodb";
import {Model} from "../db/models";
import {getDb} from "../plugins/mongodb";
import {delay} from "../utils/date-time-util";

export async function getDbCollection(dbId: ObjectId) {
  const {dbName} = await Model.Database.findOne({_id: dbId}, {projection: {dbName: 1}});
  const db = getDb(dbName)
  console.log('getDbCollection', dbName)
  try {
    await delay(500)
    const rs = await db.listCollections().toArray()
    return rs;
  } catch (e) {
    console.error(e)
    return []
  }
}

export async function createNewCollection(dbId: ObjectId, colName: string) {
  const {dbName} = await Model.Database.findOne({_id: dbId}, {projection: {dbName: 1}});
  const db = getDb(dbName)
  await db.collection(colName).insertOne({deleted: true})
  await db.collection(colName).deleteOne()
}

export async function deleteCollection(dbId: ObjectId, colName: string) {
  const {dbName} = await Model.Database.findOne({_id: dbId}, {projection: {dbName: 1}});
  const db = getDb(dbName)
  const isWebhookExist = await Model.DbWebhook.find({dbName: dbName, colName: colName})
  if (isWebhookExist) {
    throw new Error("User doesn't delete related webhook")
  } else {
    return await db.dropCollection(colName)
  }
}
