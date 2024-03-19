import {getDb} from "../plugins/mongodb";
import {Model} from "../db/models";
const {execAxios} = require('./utils');
const axios = require('axios');
import {Db} from 'mongodb';

let db: Db
let targetChangeStreams = []

export async function watchCollection() {
    try {
        let isChangeStreamActive = false;
        const originalChangeStream = db.collection('dbwebhook').watch();
        originalChangeStream.on('change', () => {
            console.log('Change detected in original collection');
            if (!isChangeStreamActive) {
                console.log('Starting changestream for target collection...');
                startChangeStream();
            }
        });
        const allDocs = await Model.DbWebhook.find({}).toArray();
        for (const doc of allDocs) {
            try {
                const db = getDb(doc.dbName);
                const collection = db.collection(doc.colName);
                const changeStream = collection.watch([]);
                changeStream.on('change', (change) => {
                    const userApi = doc.to;
                    console.log('Change detected:', change);
                    return execAxios(axios.post(`${userApi}`, {change}))
                });
                targetChangeStreams.push(changeStream)
            } catch (e) {
            console.error('Some error has happened', e)
            }
        }
        function startChangeStream() {
            isChangeStreamActive = true;
            targetChangeStreams.forEach(changeStream => {
                changeStream.resume();
            });
        }
    } catch (e) {
            throw new Error("Error happened", e)
    }
}




