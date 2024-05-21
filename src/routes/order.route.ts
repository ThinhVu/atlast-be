import {Request, Router} from 'hyper-express';
import {requireAdmin, requireUser, UserProps} from "../middlewares/auth";
import $ from "../utils/safe-call"
import {Model} from "../db/models";
import To from "../utils/data-parser";
import {IOrder} from "../db/models/order";
import {ApiError} from "../utils/common-util";
import appHooks from "../logic/hooks";

export default async function useOrder(parentRouter: Router) {

  const router = new Router()
  router.get(
    '/',
    {middlewares: [requireUser]},
    $(async (req: Request<UserProps>) => {
      const userId = req.locals.user._id;
      return Model.Order.find({userId}).toArray()
    }));

  router.get(
    '/:id',
    {middlewares: [requireUser]},
    $(async (req: Request<UserProps>) => {
      const userId = req.locals.user._id;
      const orderId = To.objectId(req.path_parameters.id);
      return Model.Order.find({_id: orderId, userId}).toArray()
    }))

  router.post(
    '/',
    {middlewares: [requireUser]},
    $(async (req: Request<UserProps>) => {
      const {configuration, region, plan, note} = await req.json()
      const userId = req.locals.user._id
      const user = await Model.Users.findOne({_id: userId})
      const configurationDoc = await Model.NodeConfiguration.findOne({code: configuration});
      if (Number(plan) < 3) throw new ApiError("E_000", "Invalid plan");
      const total = Math.abs(configurationDoc.price * Number(plan));
      if (total > user.balance) throw new ApiError("E_000", "Insufficient balance");
      await Model.Users.updateOne({_id: userId}, {$inc: {balance: -Math.abs(total)}})
      const {insertedId} = await Model.Order.insertOne({
        userId: req.locals.user._id,
        configuration,
        region,
        plan,
        note,
        total,
        createDt: new Date()
      });
      appHooks.trigger('order:created', insertedId)
      return true;
    }))

  router.put(
    '/:id/accept',
    {middlewares: [requireAdmin]},
    $(async (req: Request<UserProps>) => {
      const userId = req.locals.user._id
      const orderId = To.objectId(req.path_parameters.id)
      const qry: Partial<IOrder> = {
        _id: orderId,
        userId,
        status: "queue"
      }
      const order = await Model.Order.findOne(qry)
      if (!order) throw new ApiError('E_000', 'Order not found');
      const rs = await Model.Order.updateOne(qry, { $set: { status: "inProgress" } })
      appHooks.trigger('order:accepted', orderId);
      return true;
    }));

  router.put(
    '/:id/reject',
    {middlewares: [requireAdmin]},
    $(async (req: Request<UserProps>) => {
      const userId = req.locals.user._id
      const orderId = To.objectId(req.path_parameters.id)
      const qry: Partial<IOrder> = {
        _id: orderId,
        userId,
        status: "queue"
      }
      const order = await Model.Order.findOne(qry)
      if (!order) throw new ApiError('E_000', 'Order not found');
      const rs = await Model.Order.updateOne(qry, { $set: { status: "rejected" } })
      await Model.Users.updateOne({_id: userId}, {$inc: {balance: order.total}});
      appHooks.trigger('order:rejected', orderId);
      return true;
    }))


  router.put(
    '/:id/cancel',
    {middlewares: [requireUser]},
    $(async (req: Request<UserProps>) => {
      const userId = req.locals.user._id
      const orderId = To.objectId(req.path_parameters.id)
      const qry: Partial<IOrder> = {
        _id: orderId,
        userId,
        status: "queue"
      }
      const order = await Model.Order.findOne(qry)
      if (!order) throw new ApiError('E_000', 'Order not found');
      const rs = await Model.Order.updateOne(qry, { $set: { status: "cancelled" } })
      await Model.Users.updateOne({_id: userId}, {$inc: {balance: order.total}});
      appHooks.trigger('order:cancelled', orderId);
      return true;
    }))

  parentRouter.use('/order', router)
}