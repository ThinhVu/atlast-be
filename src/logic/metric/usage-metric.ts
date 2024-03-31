import dayjs from "dayjs";
import {getLogger} from "../../utils/logger";
import {Model} from "../../db/models";
import {ObjectId} from "mongodb";
import {MongoClient, Db} from 'mongodb';
let client: MongoClient, db: Db;

export async function usageEstimate () {
    const databaseIds = await Model.Database.aggregate([{
        $group:{
            _id: "$_id"
        }
    }]).toArray();

    for (const item of databaseIds) {
        const id = item._id
        const databaseDoc = await Model.Database.findOne({_id: id});
        if (databaseDoc) {
            const dbName = databaseDoc.dbName;
            try {
                db = client.db(dbName)
                const statics = await db.stats({scale: 1024*1024*1024});
                const useData = statics.totalSize
                return Model.UsageMetric.updateOne(
                    {databaseId: id, t: dayjs().startOf('day').toDate()},
                    {$set: {usage: useData}},
                    {upsert: true})
            } catch (error) {
                console.error('[mongodb] Failed to connect. Reason:', error)
                process.exit(1)
            }
        } else {
            console.log(`Database id ${id} doesn't exist!`);
        }
    }
}

