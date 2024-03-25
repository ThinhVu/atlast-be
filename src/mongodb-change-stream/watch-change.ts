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
        watcher.on('change', (change) => axios.post(`${changeStream.to}`, change.fullDocument));
        changeStreamCache.set(changeStream._id, watcher);
      }
    }

    const originalChangeStream = await Model.DbWebhook.watch();
    originalChangeStream.on('change', (change) => {
      console.log('Change detected in original collection', change);
      // db nao? collection nao?
      // find watcher -> stop  1 - 1 (dbName_collName)
      // xoa watcher di
      // xem operator la gi: insert, delete, update
      const operator = ''
      const doc = change.fullDocument;
      switch (operator) {
        case 'insert':
          if (changeStreamCache.get(doc._id)) {
            // ??
          }
          break;
        case 'update':
          if (changeStreamCache.get(doc._id)) {
            // TODO: assign nhung thong tin can thiet
            changeStreamCache.get(doc._id).webhookURL = doc.webhookURL
          }
          break;
        case 'delete':
          if (changeStreamCache.get(doc._id)) {
            changeStreamCache.get(doc._id).watcher.close()
            changeStreamCache.delete(doc._id)
          }
          break;
      }
    });


    await setupChangeStreams();
  } catch (e) {
    throw new Error("Error happened", e)
  }
}




