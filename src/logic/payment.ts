import {ObjectId} from "mongodb";
import {Model} from "../db/models";
import {IPaymentHistory} from "../db/models/payment-history"



//get balance
export const getCurrentBalance = async (_id: ObjectId) => {
    return Model.Users.findOne({_id})
}

//deposit money
export const depositMoney = async (_id: ObjectId, amount: number) => {
    await Model.Users.updateOne({_id},
        {$inc: {balance: amount}})
}

//update balance after payment
export const updateBalance = async(_id: ObjectId, amount: number ) => {
        return Model.Users.updateOne({_id},
            {$inc: {balance: -amount}})
}

//update payment history

export const getPaymentHistory = async (userId: ObjectId) => {
    return Model.Users.find({userId}).toArray()
}

export const updatePaymentHistory = async(userId: ObjectId, value: number) => {
    const createDt = new Date()
    const doc: IPaymentHistory = {
        userId,
        value,
        createDt,
    }
    const {insertedId} = await Model.PaymentHistory.insertOne(doc)
    doc._id = insertedId
    return doc;
}