import {ObjectId} from 'mongodb';
import {Unique, HashedIndex} from "../../utils/types";

export type IDbApiKey = Partial<{
    _id: ObjectId,
    key: HashedIndex<Unique<string>>,
    databaseId: ObjectId, //ref Database._id
    enable: boolean,
    createDt: Date,
}>