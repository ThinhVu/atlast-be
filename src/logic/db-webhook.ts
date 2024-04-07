import _ from 'lodash';
import axios from 'axios';
import {getDb} from "../plugins/mongodb";
import {ObjectId} from "mongodb";
import {Model} from "../db/models";
import {IDbWebhook} from '../db/models/db-webhook'
import DataParser from "../utils/data-parser";

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
    createDt,
    enable: true,
  }
  const {insertedId} = await Model.DbWebhook.insertOne(doc)
  doc._id = insertedId
  return doc;
}


export async function updateDbWebHook(id: ObjectId, change) {
  return Model.DbWebhook.updateOne({_id: id}, change)
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
const resumeCache: Map<string, any> = new Map()

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
    dbWebHookChangeStream.on('change', async (change) => {
      console.log(`change docs: ${JSON.stringify(change)}`)
      const operator = change.operationType
      switch (operator) {
        case 'insert':
          initWatcher(change.fullDocument)
          break;

        case 'update': {
          const key = change.documentKey._id.toString()
          const isEnable = change.updateDescription.updatedFields.enable
          if (isEnable !== null || undefined) {
            const cached = changeStreamCache.get(key)
            if (isEnable === true) {
              const doc = await Model.DbWebhook.findOne({_id: DataParser.objectId(key)})
              const resumeCached = resumeCache.get(key)
              cached.watcher = getDb(doc.dbName).collection(doc.colName).watch([], {resumeAfter: resumeCached.resumeToken});;
              cached.watcher.on('change', (change) => axios.post(`${cached.webhookURL}`, change))
            } else {
              const resumeToken = (change._id as any)._data;
              resumeCache.set(key, resumeToken)
              cached.watcher.close()
            }
          } else {
            const cached = changeStreamCache.get(key)
            if (cached) {
              cached.webhookURL = change.updateDescription.updatedFields.to
            }
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