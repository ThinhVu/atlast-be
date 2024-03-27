import axios from 'axios';
import _ from 'lodash';
import {getDb} from "../plugins/mongodb";
import {Model} from "../db/models";
import {ObjectId} from "mongodb";

const changeStreamCache: Map<ObjectId, ChangeStreamCacheValue> = new Map();

type ChangeStreamCacheValue = {
  webhookURL: string,
  watcher: any, // TODO
}

export async function watchCollection() {
  try {
    async function setupChangeStreams() {
      const changeStreams = await Model.DbWebhook.find().toArray();
      if (_.isEmpty(changeStreams)) return;
      for (const changeStream of changeStreams) {
        const watcher = getDb(changeStream.dbName).collection(changeStream.colName).watch();
        const webhookURL = changeStream.to
        watcher.on('change', (change) => axios.post(`${webhookURL}`, change));
        changeStreamCache.set(changeStream._id, {webhookURL,watcher});
      }
    }

    const originalChangeStream = await Model.DbWebhook.watch();
    originalChangeStream.on('change', (change) => {
      console.log('Change detected in original collection', change);
      // db nao? collection nao?
      // find watcher -> stop  1 - 1 (dbName_collName)
      // xoa watcher di
      // xem operator la gi: insert, delete, update
      const operator = change.operationType
      //const doc = change;
      switch (operator) {
        case 'insert':
          // if (changeStreamCache.get(change.documentKey._id)) {
          //   changeStreamCache.get(change.documentKey._id).webhookURL = change.fullDocument.to
          //   changeStreamCache.get(change.documentKey._id).watcher = getDb(change.fullDocument.dbName).collection(change.fullDocument.colName).watch()
          // }
          const webhookURL = change.fullDocument.to;
          const watcher = getDb(change.fullDocument.dbName).collection(change.fullDocument.colName).watch();
          watcher.on('change', (change) => axios.post(`${webhookURL}`, change));
          changeStreamCache.set(change.documentKey._id, {webhookURL,watcher});
          break;
        case 'update':
          if (changeStreamCache.get(change.documentKey._id)) {
            // TODO: assign nhung thong tin can thiet
            changeStreamCache.get(change.documentKey._id).webhookURL = change.updateDescription.updatedFields.to
          }
          break;
        case 'delete':
          if (changeStreamCache.get(change.documentKey._id)) {
            changeStreamCache.get(change.documentKey._id).watcher.close()
            changeStreamCache.delete(change.documentKey._id)
          }
          break;
      }
    });


    await setupChangeStreams();
  } catch (e) {
    throw new Error("Error happened", e)
  }
}




