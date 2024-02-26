import dayjs from "dayjs";
import {getLogger} from "../../utils/logger";
import {Model} from "../../db/models";
import {ObjectId} from "mongodb";

//dùng group để lấy databaseId duy nhất
//thêm vòng lặp for để duyệt qua các database id trong csdl
//thực hiện các chức năng khác cho tới khi update hết
export async function usageEstimate (did: ObjectId, atDay?: Date) {
    atDay = atDay || new Date()

    const data = await Model.Database.findOne({_id:did});
    const dbName = data.name;
    //lấy hàm connect với database
    //const db = client.db(dbName)
    //const statics = await db.stats({scale: 1024*1024});
    //const useData = statics.totalSize

    return Model.UsageMetric.updateOne(
        {dataId: did, t: dayjs(atDay).startOf('day').toDate()},
        {$set: {usage: useData}},
        {upsert: true}
    )
}