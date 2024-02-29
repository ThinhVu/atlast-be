import dayjs from "dayjs";
import {getLogger} from "../../utils/logger";
import {Model} from "../../db/models";
import {ObjectId} from "mongodb";
import {MongoClient, Db} from 'mongodb';
let client: MongoClient, db: Db;

//loại bỏ connection to mongodb, xem cách để chèn hàm connect (trong file mongodb để kết nối)

let prevTopStats = {}
export async function getCurrentMongoTop() {
    try {
        const url = 'mongodb://localhost:27017'
        const client = new MongoClient(url)
        const db = client.db('admin')
        const {totals} = await db.command({top: 1});
        const result = [];
        for (const ns in totals) {
            if (ns !== "note") {
                const {writeLock, readLock, total} = totals[ns]
                const totalTime = total.time;
                const totalCount = total.count;
                const writeTime = writeLock.time;
                const writeCount = writeLock.count;
                const readTime = readLock.time;
                const readCount = readLock.count;

                const prevStats = prevTopStats[ns] || totals[ns]

                if (totalTime === prevStats.total.time) {
                    result.push({
                        nameSpace: ns,
                        total: {time: 0, count: 0},
                        read: {time: 0, count: 0},
                        write: {time: 0, count: 0}
                    })
                } else {
                    result.push({
                        nameSpace: ns,
                        total: {
                            time: (totalTime - prevStats.total.time) / 1000,
                            count: (totalCount - prevStats.total.count),
                        },
                        read: {
                            time: (readTime - prevStats.readLock.time) / 1000,
                            count: (readCount - prevStats.readLock.count),
                        },
                        write: {
                            time: (writeTime - prevTopStats[ns].writeLock.time) / 1000,
                            count: (writeCount - prevTopStats[ns].writeLock.count),
                        },
                    })
                }
            }
        }
        prevTopStats = totals;
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