import dayjs from "dayjs";
import {getLogger} from "../../utils/logger";
import {Model} from "../../db/models";
import {ObjectId} from "mongodb";
import {MongoClient, Db} from 'mongodb';
let client: MongoClient, db: Db;

export async function getServerMetricNow() {
    try {
        client = new MongoClient(process.env.URI)
        const mongoStats = await client.db('admin').command({serverStatus: 1});
        const cache_dirty = mongoStats.wiredTiger.cache['tracked dirty bytes in the cache']
        const cache_max = mongoStats.wiredTiger.cache['maximum bytes configured']
        const cache_byte = mongoStats.wiredTiger.cache['bytes currently in the cache']
        const {resident, virtual} = mongoStats.mem;
        return {
            opCounts: mongoStats.opcounters,
            dirty: cache_dirty/cache_max,
            used: cache_byte/cache_max,
            vSize: virtual/1024,
            res: resident/1024,
            at: dayjs().startOf('day').toDate()
        }
    } catch (error) {
        console.error('[mongodb] Failed to connect. Reason:', error)
        process.exit(1)
    }
}

export async function snapshot() {
    const serverMetric = await getServerMetricNow()
    const updateData = {
        opCounters: serverMetric.opCounts,
        cache: {
            dirty: serverMetric.dirty,
            used: serverMetric.used,
        },
        memory: {
            vSize: serverMetric.vSize,
            res: serverMetric.res
        },
        at: serverMetric.at
    }
    await Model.ServerMetric.updateOne({at: serverMetric.at}, {$set: updateData}, {upsert: true})
}

//next step
//write function to get server metric each 5 seconds when an event occur
//or a condition meets requirement