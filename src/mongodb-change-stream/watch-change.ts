import {getColl, getDb} from "../plugins/mongodb";
import {Model} from "../db/models";
const {execAxios} = require('./utils');
const axios = require('axios');
import {Db} from 'mongodb';

let db: Db
let changeStreams = []
const cacheChangeStream: Map<any, any> = new Map();

export async function watchCollection() {

    try {
        let changeStreamChange = false;

        // async function startChangeStream(change) {
        //     if (changeStreamChange) {
        //         changeStreams.forEach(changeStream => {
        //             if (!cacheChangeStream[changeStream]) {
        //                 cacheChangeStream[changeStream] = change.fullDocument/* change stream collection */
        //             }
        //         }
        //     }
        //     await setupChangeStreams()
        // }

        async function setupChangeStreams() {
            const changeStreams = await Model.DbWebhook.find({}).toArray();
            if (!changeStreams || changeStreams.length === 0) return;

            changeStreams.forEach(changeStream => {
                if (!cacheChangeStream.has(changeStream._id)) {
                    cacheChangeStream.set(changeStream._id, getDb(changeStream.dbName).collection(changeStream.colName).watch());
                    cacheChangeStream.get(changeStream._id).on('change', (change) => {
                        const userApi = changeStream.to;
                        return execAxios(axios.post(`${userApi}`, change.fullDocument))
                    });
                }
                //     if (!cacheChangeStream[changeStream._id]) {
                //         cacheChangeStream[changeStream._id] = getDb(changeStream.dbName).collection(changeStream.colName).watch();
                //         cacheChangeStream[changeStream].on('change', (change) => {
                //             const userApi = changeStream.to;
                //             return execAxios(axios.post(`${userApi}`, change.fullDocument))
                //         });
                //     }
                // },
            })
        }
        await setupChangeStreams();

        const originalChangeStream = await Model.DbWebhook.watch();
        originalChangeStream.on('change', (change) => {
            console.log('Change detected in original collection', change);
            changeStreamChange = true
            // await startChangeStream(change)
        });
    } catch (e) {
    throw new Error("Error happened", e)
    }
}




