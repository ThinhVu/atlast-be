import {ObjectId} from "mongodb";
import {Indexed} from "../../../utils/types";

export interface MongodbOpCounters {
    insert: number,
    query: number,
    update: number,
    delete: number,
    getmore: number,
    command: number,
}

export interface MongoCache {
    dirty: number,
    used: number
}

export interface MongoMem {
    vSize: number,
    res: number,
}

export type IServerMetric = Partial<{
    _id: ObjectId,
    opCounters: MongodbOpCounters,
    cache: MongoCache,
    memory: MongoMem,
    at: Indexed<Date>,
}>