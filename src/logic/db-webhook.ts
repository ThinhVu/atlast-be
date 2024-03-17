import {ObjectId} from "mongodb";
import {v4} from "uuid";
import {Model} from "../db/models";
import uuid from 'time-uuid';
import {IDbWebhook} from '../db/models/db-webhook'

export async function listDbWebHook(userId: ObjectId) {
    return Model.DbWebhook.find({userId}).toArray()
}

export async function createDbWebHook(userId: ObjectId, data) {
    const createDt = new Date()
    const {dbName, colName, to} = data;
    const doc: IDbWebhook = {
        userId,
        dbName,
        colName,
        to,
    }
    const {insertedId} = await Model.DbWebhook.insertOne(doc)
    doc._id = insertedId
    return doc;
}

export async function updateDbWebHook(id: ObjectId, change) {
    return Model.DbWebhook.findOneAndUpdate({_id: id}, {$set: change})
}

export async function deleteDbWebHook(id: ObjectId) {
    return Model.DbWebhook.deleteOne({_id: id})
}