import {ObjectId} from "mongodb";
import {Indexed} from "../../../utils/types";
import {ms} from "../../../utils/types";

export interface ITopLock {
    time: ms<number>,
    count: number,
}
export type IMongoTop = Partial<{
    _id: ObjectId,
    nameSpace: string,
    total: ITopLock,
    read: ITopLock,
    write: ITopLock,
    at: Indexed<Date>
}>

