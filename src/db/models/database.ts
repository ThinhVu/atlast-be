import {ObjectId} from 'mongodb';

export type IDatabase = Partial<{
    _id: ObjectId,
    userId: ObjectId, //ref: User._id
    name: string,
    username: string,
    password: string,
    sizeInGB: number,
    metrics: Object,
    collections: string[],
    createDt: Date
}>