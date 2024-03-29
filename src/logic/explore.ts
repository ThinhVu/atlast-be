import {ObjectId} from "mongodb";
import {Model} from "../db/models";
import {getDb} from "../plugins/mongodb";

export async function getDbCollection(userId: ObjectId, dbId: ObjectId) {
    const {dbName} = await Model.Database.findOne({_id: dbId}, {projection: {dbName: 1}});
    const db = getDb(dbName)
    return db.listCollections().toArray()
}

export async function createNewCollection(userId: ObjectId, dbId: ObjectId, colName: string) {
    const {dbName} = await Model.Database.findOne({_id: dbId}, {projection: {dbName: 1}});
    const db = getDb(dbName)
    await db.collection(colName).insertOne({deleted: true})
    await db.collection(colName).deleteOne()
}

export async function deleteCollection(userId: ObjectId, dbId: ObjectId, colName: string) {
    const {dbName} = await Model.Database.findOne({_id: dbId}, {projection: {dbName: 1}});
    const db = getDb(dbName)
    const isWebhookExist = await Model.DbWebhook.find({dbName: dbName, colName: colName})
    if (isWebhookExist) {
        throw new Error("User doesn't delete related webhook")
    } else {
       return await db.dropCollection(colName)
    }
}
