import _ from 'lodash';
import axios from 'axios';
import {getDb} from "../plugins/mongodb";
import {ObjectId} from "mongodb";
import {Model} from "../db/models";
import {IDbWebhook} from '../db/models/db-webhook'

export async function listDbWebHook(userId: ObjectId) {
  return Model.DbWebhook.find({userId}).toArray()
}

export async function createDbWebHook(userId: ObjectId, data: IDbWebhook) {
  const {dbName, colName, desc, to} = data;
  const db = await Model.Database.findOne({userId, dbName})
  if (!db) throw new Error(`Database is not existed`)
  const doc: IDbWebhook = {
    dbName,
    colName,
    desc,
    to,
    createDt: new Date()
  }
  const {insertedId} = await Model.DbWebhook.insertOne(doc)
  doc._id = insertedId
  return doc;
}

export async function updateDbWebHook(id: ObjectId, change: IDbWebhook) {
  return Model.DbWebhook.findOneAndUpdate({_id: id}, {$set: change})
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