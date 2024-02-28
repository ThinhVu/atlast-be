import {ObjectId} from "mongodb";
import {Indexed} from "../../../utils/types";
import {Gb} from "../../../utils/types"

export interface MongodbOpCounters {
    insert: number,
    query: number,
    update: number,
    delete: number,
    getmore: number,
    command: number,
}

export interface MongoCache {
    dirty: Gb<number>,
    used: Gb<number>,
}

export interface MongoMem {
    vSize: Gb<number>,
    res: Gb<number>,
}

export type IMongoStats = Partial<{
    _id: ObjectId,
    opCounters: MongodbOpCounters,
    cache: MongoCache,
    memory: MongoMem,
    at: Indexed<Date>,
}>