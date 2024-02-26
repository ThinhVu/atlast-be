import {ObjectId} from "mongodb";
import {Indexed} from "../../utils/types";

export type IUsageHistory = Partial<{
    _id: ObjectId;
    databaseId: ObjectId; //ref: Database._id
    usage: number;
    createDt: Date
}>