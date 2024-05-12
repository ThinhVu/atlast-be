import {ObjectId} from "mongodb";
import {Model} from "../db/models";
import {IPaymentHistory} from "../db/models/payment-history"


//get balance
export const getCurrentBalance = async (_id: ObjectId) => {
  return Model.Users.findOne({_id})
}

//update balance after payment
export const updateBalance = async (uid: ObjectId, amount: number) => {

}


//get payment history
export const getPaymentHistory = async (userId: ObjectId) => {
  return Model.PaymentHistory.find({userId}).toArray()
}