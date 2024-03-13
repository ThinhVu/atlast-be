import {ObjectId} from "mongodb";
import {v4} from "uuid";
import {Model} from "../db/models";
import uuid from 'time-uuid';
import {IWebhook} from '../db/models/user-webhook'

export async function listUserApi(userId: ObjectId) {
    return Model.Webhook.find({userId}).toArray()
}

export async function registerNewUserWebhook(userId: ObjectId, data) {
    const createDt = new Date()
    const {dbName, colName, to, operationType} = data;
    const doc: IWebhook = {
        userId,
        dbName,
        colName,
        to,
        operationType,
        createDt,
    }
    const {insertedId} = await Model.Webhook.insertOne(doc)
    doc._id = insertedId
    return doc;
}

export async function updateUserWebhook(userId: ObjectId, id: ObjectId, change) {
    return Model.Webhook.findOneAndUpdate({_id: id, userId}, change)
}

export async function deleteUserWebhook(userId: ObjectId, id: ObjectId) {
    return Model.Webhook.deleteOne({_id: id, userId})
}