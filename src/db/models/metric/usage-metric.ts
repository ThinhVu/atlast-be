import {ObjectId} from "mongodb";
import {Indexed} from "../../../utils/types";


export type IUsageMetric = Partial<{
    _id: ObjectId,
    databaseId: ObjectId, //ref: Database._id
    usage: number, //usage
    t: Indexed<Date>,
}>