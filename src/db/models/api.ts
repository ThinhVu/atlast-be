import {ObjectId} from 'mongodb';
import {Unique} from "../../utils/types";

export type IAPI = Partial<{
    _id: ObjectId,
    value: Unique<string>,
    databaseId: ObjectId, //ref Database._id
    enable: boolean,
    createDt: Date,
}>