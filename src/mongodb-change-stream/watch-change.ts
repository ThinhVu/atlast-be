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

        async function startChangeStream() {
            isChangeStreamActive = true;
            await setupChangeStreams()
        }

        async function setupChangeStreams() {
            const allDocs = await Model.DbWebhook.find({}).toArray();
            console.log(`document is: ${allDocs}`)
            if (!allDocs || allDocs.length === 0) return;

            //close the old changestream
            targetChangeStreams.forEach(changeStream => {
                changeStream.close();
            });
            targetChangeStreams = [];

            for (const doc of allDocs) {
                try {
                    const name = await Model.Database.findOne({userId: doc.userId, name: doc.dbName});
                    const db = getDb(name.dbName);
                    const userApi = doc.to;
                    const changeStream = db.collection(doc.colName).watch();
                    changeStream.on('change', (change) => {
                        console.log('Change detected:', JSON.stringify(change));
                        return execAxios(axios.post(`${userApi}`, {change}))
                    });
                    targetChangeStreams.push(changeStream)
                } catch (e) {
                    console.error('Some error has happened', e)
                }
            }
        }
        await setupChangeStreams();

        const originalChangeStream = await Model.DbWebhook.watch();
        originalChangeStream.on('change', async () => {
            console.log('Change detected in original collection');
            if (!isChangeStreamActive) {
                console.log('Starting change stream for target collection...');
                await startChangeStream();
            }
            await setupChangeStreams();
        });
    } catch (e) {
    throw new Error("Error happened", e)
    }
}




