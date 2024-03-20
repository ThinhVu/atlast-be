import {ObjectId} from 'mongodb';
import {Gb} from "../../utils/types";
import {Indexed} from "../../utils/types";

export type IDatabase = Partial<{
    _id: ObjectId,
    userId: Indexed<ObjectId>, //ref: User._id
    // ten do nguoi dung dat
    name: string,
    // ten db
    dbName: string,
    username: string,
    password: string,
    sizeInGB: number,
    metrics: Object,
    createDt: Date
}>

export type IDatabaseInfo = Partial<{
    _id: ObjectId,
    databaseId: ObjectId, // ref Database._id
    storageSize: Gb<number>,
    collections: number,
    objects: number,
    dataSize: Gb<number>,
    indexes: number,
    indexSize: Gb<number>,
}>