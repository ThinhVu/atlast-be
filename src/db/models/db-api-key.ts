import {ObjectId} from 'mongodb';
import {Unique} from "../../utils/types";

export type IDbApiKey = Partial<{
    _id: ObjectId,
    key: Unique<string>,
    databaseId: ObjectId, //ref Database._id
    enable: boolean,
    createDt: Date,
}>