import dayjs from "dayjs";
import {getLogger} from "../../utils/logger";
import {Model} from "../../db/models";
import {ObjectId} from "mongodb";
import {MongoClient, Db} from 'mongodb';
let client: MongoClient, db: Db;

//loại bỏ connection to mongodb, xem cách để chèn hàm connect (trong file mongodb để kết nối)

export async function getCurrentMongoTop() {
    try {
        const mongoTop = await client.db('admin').command({top: 1});
        const topStats = mongoTop.totals;
        const result = [];
        for (const ns in topStats) {
            if (ns !== "note") {
                result.push({
                    nameSpace: ns,
                    total: topStats[ns].total.time,
                    read: topStats[ns].readLock.time,
                    write: topStats[ns].writeLock.time,
                    at: dayjs().startOf('day').toDate()
                })
            }
        }
        return result;
    } catch (error) {
        console.error('[mongodb] Failed to connect. Reason:', error)
        process.exit(1)
    }
}

export async function snapshot() {
    const topMetrics = await getCurrentMongoTop()
    for (const top in topMetrics) {
        const updateData = topMetrics[top];
        await Model.MongoTop.updateOne({at: updateData.at, nameSpace: updateData.nameSpace}, {$set: updateData}, {upsert: true})
    }
}


//next step
//write function to get mongotop metric each 5 seconds when an event occur
//or a condition meets requirement