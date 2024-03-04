import {Request, Router} from "hyper-express";
import {requireUser, UserProps} from "../middlewares/auth";
import $ from "../utils/safe-call";
import To from "../utils/data-parser";
import {lists, create, update, remove} from "../logic/api-key";
import {throwIfUserDoesNotOwnDb} from "../logic/database";

export default async function useDatabase(parentRouter: Router) {
  console.log('[route] useDatabase')
  const router = new Router();

  router.get('/:dbId',
    {middlewares: [requireUser]},
    $(async (req: Request<UserProps>) => {
      const dbId = To.objectId(req.path_parameters.dbId)
      await throwIfUserDoesNotOwnDb(req.locals.user._id, dbId)
      return lists(dbId)
    }))

  router.post('/:dbId',
    {middlewares: [requireUser]},
    $(async (req: Request<UserProps>) => {
      const dbId = To.objectId(req.path_parameters.dbId)
      await throwIfUserDoesNotOwnDb(req.locals.user._id, dbId)
      return create(dbId)
    }))

  router.put('/:dbId/:apiKey',
    {middlewares: [requireUser]},
    $(async (req: Request<UserProps>) => {
      const dbId = To.objectId(req.path_parameters.dbId)
      await throwIfUserDoesNotOwnDb(req.locals.user._id, dbId)
      const {enable} = await req.json()
      return update(dbId, req.path_parameters.apiKey, {$set: {enable}})
    }))

  router.delete('/:dbId/:apiKey',
    {middlewares: [requireUser]},
    $(async (req: Request<UserProps>) => {
      const dbId = To.objectId(req.path_parameters.dbId)
      await throwIfUserDoesNotOwnDb(req.locals.user._id, dbId)
      return remove(dbId, req.path_parameters.apiKey)
    }))

  parentRouter.use('/api-key', router);
}
