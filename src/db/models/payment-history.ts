import {ObjectId} from 'mongodb';

export type IPaymentHistory = Partial<{
    _id: ObjectId,
    userId: ObjectId, //ref: User._id
    value: number,
    //type: string,
    createDt: Date,
}>