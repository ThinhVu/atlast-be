import {ObjectId} from "mongodb";
import {Model} from "../db/models";
import {getDb} from "../plugins/mongodb";
import {delay} from "../utils/date-time-util";

export async function getDbCollection(dbId: ObjectId) {
  const {dbName} = await Model.Database.findOne({_id: dbId}, {projection: {dbName: 1}});
  const db = getDb(dbName)
  console.log('getDbCollection', dbName)
  return db.listCollections().toArray()
}

export async function createNewCollection(dbId: ObjectId, colName: string) {
  const {dbName} = await Model.Database.findOne({_id: dbId}, {projection: {dbName: 1}});
  const db = getDb(dbName)
  await db.collection(colName).insertOne({deleted: true})
  await db.collection(colName).deleteOne()
}

export async function deleteCollection(dbId: ObjectId, colName: string) {
  const {dbName} = await Model.Database.findOne({_id: dbId}, {projection: {dbName: 1}});
  const webhook = await Model.DbWebhook.find({dbName: dbName, colName: colName}).toArray()
  if (webhook.length !== 0) {
    console.log('webhooks related to this collection are not deleted')
    return false;
  } else {
    const db = getDb(dbName)
    await db.dropCollection(colName)
    return true;
  }
}
