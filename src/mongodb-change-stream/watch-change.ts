import {getDb} from "../plugins/mongodb";
import {Model} from "../db/models";
const {execAxios} = require('../utils');
const axios = require('axios');

export async function watchCollection() {
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
        } catch (e) {
            throw new Error("Error happened", e)
        }
    }
}


let watchColInterval: NodeJS.Timeout;
export function runWatchCollection() {
    watchColInterval = setInterval(watchCollection, 5000);
}




