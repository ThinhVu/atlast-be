import {ObjectId} from "mongodb";
import {v4} from "uuid";
import {Model} from "../db/models";
import uuid from 'time-uuid';
import {IDbWebhook} from '../db/models/db-webhook'

export async function listDbWebHook(dbId: ObjectId) {
    const {dbName} = await Model.Database.findOne({_id: dbId}, {projection: {dbName: 1}})
    return Model.DbWebhook.find({dbName: dbName}).toArray()
}

export async function createDbWebHook(dbId: ObjectId, data) {
    const createDt = new Date()
    const {colName, to} = data;
    const {dbName} = await Model.Database.findOne({_id: dbId})
    const doc: IDbWebhook = {
        dbName,
        colName,
        to,
        createDt
    }
    const {insertedId} = await Model.DbWebhook.insertOne(doc)
    doc._id = insertedId
    return doc;
}

export async function updateDbWebHook(id: ObjectId, to) {
    return Model.DbWebhook.updateOne({_id: id}, {$set:{to: to}})
}

export async function deleteDbWebHook(id: ObjectId) {
    return Model.DbWebhook.deleteOne({_id: id})
}