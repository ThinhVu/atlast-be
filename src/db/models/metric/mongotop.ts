import {ObjectId} from "mongodb";
import {Indexed} from "../../../utils/types";
import {ms} from "../../../utils/types";

export type IMongoTop = Partial<{
    _id: ObjectId,
    nameSpace: string,
    total: ms<number>,
    read: ms<number>,
    write: ms<number>,
    at: Indexed<Date>
}>

