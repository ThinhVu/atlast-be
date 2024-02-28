import {ObjectId} from "mongodb";
import {Indexed} from "../../utils/types";
import {Gb} from "../../utils/types";

export type IDbUsageHistory = Partial<{
    _id: ObjectId;
    databaseId: Indexed<ObjectId>; //ref: Database._id
    usage: Gb<number>;
    createDt: Date
}>
