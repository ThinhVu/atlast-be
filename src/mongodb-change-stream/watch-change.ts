import axios from 'axios';
import _ from 'lodash';
import {getDb} from "../plugins/mongodb";
import {Model} from "../db/models";
import {IDbWebhook} from "../db/models/db-webhook";

const changeStreamCache: Map<string, ChangeStreamCacheValue> = new Map();

type ChangeStreamCacheValue = {
  webhookURL: string,
  watcher: any, // TODO
}

export async function watchCollection() {
  try {
    function initWatcher(dbWebHook: IDbWebhook) {
      const watcher = getDb(dbWebHook.dbName).collection(dbWebHook.colName).watch();
      const webhookURL = dbWebHook.to
      watcher.on('change', (change) => axios.post(`${webhookURL}`, change));
      changeStreamCache.set(dbWebHook._id.toString(), {webhookURL,watcher});
    }

    async function setupWatchers() {
      const dbWebHooks = await Model.DbWebhook.find().toArray();
      if (_.isEmpty(dbWebHooks)) return;
      for (const dbWebHook of dbWebHooks) {
        initWatcher(dbWebHook)
      }
    }

    const dbWebHookChangeStream = Model.DbWebhook.watch();
    dbWebHookChangeStream.on('change', (change) => {
      console.log('Change detected in original collection', change);
      // db nao? collection nao?
      // find watcher -> stop  1 - 1 (dbName_collName)
      // xoa watcher di
      // xem operator la gi: insert, delete, update
      const operator = change.operationType
      switch (operator) {
        case 'insert':
          initWatcher(change.fullDocument)
          break;
        case 'update': {
          const key = change.documentKey._id.toString()
          const cached = changeStreamCache.get(key)
          if (cached) {
            // TODO: assign nhung thong tin can thiet
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




