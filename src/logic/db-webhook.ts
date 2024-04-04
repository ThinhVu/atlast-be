import _ from 'lodash';
import axios from 'axios';
import {getDb} from "../plugins/mongodb";
import {ObjectId} from "mongodb";
import {Model} from "../db/models";
import {IDbWebhook} from '../db/models/db-webhook'

export async function listDbWebHook(dbId: ObjectId, colName: string) {
  const {dbName} = await Model.Database.findOne({_id: dbId}, {projection: {dbName: 1}})
  return Model.DbWebhook.find({dbName: dbName, colName: colName}).toArray()
}

export async function createDbWebHook(dbId: ObjectId, colName, to) {
  const createDt = new Date()
  const {dbName} = await Model.Database.findOne({_id: dbId})
  const doc: IDbWebhook = {
    dbName,
    colName: colName,
    to,
    createDt
  }
  const {insertedId} = await Model.DbWebhook.insertOne(doc)
  doc._id = insertedId
  return doc;
}

export async function updateDbWebHook(id: ObjectId, to) {
  return Model.DbWebhook.updateOne({_id: id}, {$set: {to: to}})
}

export async function deleteDbWebHook(id: ObjectId) {
  return Model.DbWebhook.deleteOne({_id: id})
}

// change stream watcher
type ChangeStreamCacheValue = {
  webhookURL: string,
  watcher: any, // TODO
}
const changeStreamCache: Map<string, ChangeStreamCacheValue> = new Map();

export async function watchCollection() {
  function initWatcher(dbWebHook: IDbWebhook) {
    const watcher = getDb(dbWebHook.dbName).collection(dbWebHook.colName).watch();
    const webhookURL = dbWebHook.to
    watcher.on('change', (change) => axios.post(`${webhookURL}`, change));
    changeStreamCache.set(dbWebHook._id.toString(), {webhookURL, watcher});
  }

  async function setupWatchers() {
    const dbWebHooks = await Model.DbWebhook.find().toArray();
    if (_.isEmpty(dbWebHooks)) return;
    for (const dbWebHook of dbWebHooks) {
      initWatcher(dbWebHook)
    }
  }

  try {
    const dbWebHookChangeStream = Model.DbWebhook.watch();
    dbWebHookChangeStream.on('change', (change) => {
      const operator = change.operationType
      switch (operator) {
        case 'insert':
          initWatcher(change.fullDocument)
          break;
        case 'update': {
          const key = change.documentKey._id.toString()
          const cached = changeStreamCache.get(key)
          if (cached) {
            cached.webhookURL = change.updateDescription.updatedFields.to
          }
          break;
        }
        case 'delete': {
          const key = change.documentKey._id.toString()
          const cached = changeStreamCache.get(key)
          if (cached) {
            cached.watcher.close()
            changeStreamCache.delete(key)
          }
          break;
        }
      }
    });
    await setupWatchers();
  } catch (e) {
    throw new Error("Error happened", e)
  }
}