import {Request, Router} from "hyper-express";
import {requireUser, UserProps} from "../middlewares/auth";
import $ from "../utils/safe-call";
import {listDbWebHook, createDbWebHook, updateDbWebHook, deleteDbWebHook, watchCollection} from "../logic/db-webhook";
import DataParser from "../utils/data-parser";

export default async function useDbWebhook(parentRouter: Router) {
  console.log('[route] useDbWebhook')
  const router = new Router();

  watchCollection()

  router.get('/:dbId/:colName',
    {middlewares: [requireUser]},
    $(async (req: Request<UserProps>) => {
      return listDbWebHook(DataParser.objectId(req.path_parameters.dbId), DataParser.str(req.path_parameters.colName))
    }))

  router.post('/:dbId/:colName',
    {middlewares: [requireUser]},
    $(async (req: Request<UserProps>) => {
      const {to} = await req.json();
      return createDbWebHook(DataParser.objectId(req.path_parameters.dbId), DataParser.str(req.path_parameters.colName), to)
    }))

  router.put('/:dbId/:colName/:id',
    {middlewares: [requireUser]},
    $(async (req: Request<UserProps>) => {
      const {to} = await req.json();
      return updateDbWebHook(DataParser.objectId(req.path_parameters.id), {$set: {to}})
    }))

  router.put('/:id',
    {middlewares: [requireUser]},
    $(async (req: Request<UserProps>) => {
      const {enable} = await req.json();
      return updateDbWebHook(DataParser.objectId(req.path_parameters.id), {$set: {enable}})
    }))

  router.delete('/:id',
    {middlewares: [requireUser]},
    $(async (req: Request<UserProps>) => {
      return deleteDbWebHook(DataParser.objectId(req.path_parameters.id))
    }))

  parentRouter.use('/db-webhook', router);
}
