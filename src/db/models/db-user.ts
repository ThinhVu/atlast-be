import {ObjectId} from "mongodb";

export type IDbUser = Partial<{
    _id: ObjectId,
    username: string,
    password: string,
    balance: number,
    database: string,
    collections: string[],
    validate: boolean,
}>