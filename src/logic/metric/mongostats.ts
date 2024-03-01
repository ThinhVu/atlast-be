import dayjs from "dayjs";
import {getLogger} from "../../utils/logger";
import {Model} from "../../db/models";
import {ObjectId} from "mongodb";
import {MongoClient, Db} from 'mongodb';
import {snapshot} from "./mongotop";
let client: MongoClient, db: Db;

export async function getCurrentMongoStats() {
    try {
        const mongoStats = await client.db('admin').command({serverStatus: 1});
        const cacheDirty = mongoStats.wiredTiger.cache['tracked dirty bytes in the cache']
        const cacheMax = mongoStats.wiredTiger.cache['maximum bytes configured']
        const cacheByte = mongoStats.wiredTiger.cache['bytes currently in the cache']
        const {resident, virtual} = mongoStats.mem;
        return {
            opCounts: mongoStats.opcounters,
            dirty: cacheDirty/cacheMax,
            used: cacheByte/cacheMax,
            vSize: virtual/1024,
            res: resident/1024,
            at: dayjs().startOf('day').toDate()
        }
    } catch (error) {
        console.error('[mongodb] Failed to connect. Reason:', error)
        process.exit(1)
    }
}

export async function getCurrentSnapshot() {
    const mongoStats = await getCurrentMongoStats()
    const updateData = {
        opCounters: mongoStats.opCounts,
        cache: {
            dirty: mongoStats.dirty,
            used: mongoStats.used,
        },
        memory: {
            vSize: mongoStats.vSize,
            res: mongoStats.res
        },
        at: mongoStats.at
    }
    await Model.MongoStats.updateOne({at: mongoStats.at}, {$set: updateData}, {upsert: true})
}

let mongoStatsInterval;
export function startMongoStats() {
    try {
        mongoStatsInterval = setInterval(async () => {
            await getCurrentSnapshot();
        }, 5000);
    } catch (error) {
        console.error('Error starting Mongotop:', error);
    }
}

export function stopMongoStats() {
    clearInterval(mongoStatsInterval);
}