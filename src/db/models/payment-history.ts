import {ObjectId} from 'mongodb';

export type IPaymentHistory = Partial<{
    _id: ObjectId,
    userId: ObjectId, // ref: User._id
    type: string, // paypal | square | ...
    id: string, // paypal payment id | square payment id | ...
    metadata: any,
    createDt: Date,
}>