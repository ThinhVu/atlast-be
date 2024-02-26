import {ObjectId} from "mongodb";
import {Indexed} from "../../../utils/types";

export type IUsageMetric = Partial<{
    _id: ObjectId,
    dataId: ObjectId, //ref: Database._id
    usage: number, //usage
    t: Indexed<Date>,
}>