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