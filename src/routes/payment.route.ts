import {Request, Router} from "hyper-express";
import {requireUser, UserProps} from "../middlewares/auth";
import $ from "../utils/safe-call";
import {getCurrentBalance, getPaymentHistory} from '../logic/payment'
import DataParser from "../utils/data-parser";
import {Model} from "../db/models";
// @ts-ignore
import checkoutNodeJssdk from '@paypal/checkout-server-sdk';

export default async function usePayment(parentRouter: Router) {
  console.log('[route] usePayment')
  const router = new Router();

  router.get('/',
    {middlewares: [requireUser]},
    $(async (req: Request<UserProps>) => {
      return getCurrentBalance(req.locals.user._id)
    }))

  router.get('/history',
    {middlewares: [requireUser]},
    $(async (req: Request<UserProps>) => {
      return getPaymentHistory(req.locals.user._id)
    }))

  router.post('/pay',
    {middlewares: [requireUser]},
    $(async (req: Request<UserProps>) => {
      const captureResponse = await req.json()
      const {id, purchase_units} = captureResponse;
      // checking if payment id exists, if yes then throw an error
      const paymentInfo = await Model.PaymentHistory.findOne({id})
      if (paymentInfo) throw new Error("Payment existed");
      const {amount, custom_id} = purchase_units[0];
      const value = Number(amount.value);
      if (Number.isNaN(value))
        throw new Error("Invalid payment: Bad amount value");
      // check if payment is completed
      const request = new checkoutNodeJssdk.orders.OrdersGetRequest(id)
      const ppResponse = await global.paypalClient.execute(request);
      const {statusCode, result: ppInfo} = ppResponse;
      const isPaymentCompleted = statusCode === 200 && ppInfo.status === "COMPLETED" && ppInfo.intent === "CAPTURE"
      if (isPaymentCompleted) {
        const userId = DataParser.objectId(custom_id)
        const {insertedId} = await Model.PaymentHistory.insertOne({
          userId,
          type: "PayPal",
          id,
          metadata: captureResponse,
          createDt: new Date(),
        });
        await Model.UserBalanceHistories.insertOne({
          uid: userId,
          change: value,
          metadata: {
            reason: "buy",
            from: insertedId
          },
          at: new Date()
        });
        await Model.Users.updateOne({_id: userId}, {$inc: {balance: value}})
        return true;
      } else {
        throw new Error("Invalid payment: Payment is not complete")
      }
    }))

  parentRouter.use('/payment', router);
}