import {ObjectId} from "mongodb";
import {Indexed} from "../../../utils/types";

export type IMongoTop = Partial<{
    _id: ObjectId,
    nameSpace: string,
    total: number,
    read: number,
    write: number,
    at: Indexed<Date>
}>

