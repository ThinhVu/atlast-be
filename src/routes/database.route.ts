import {Request, Router} from "hyper-express";
import {requireUser, UserProps} from "../middlewares/auth";
import $ from "../utils/safe-call";
import {listDbs, createDb, removeDb} from "../logic/database";
import DataParser from "../utils/data-parser";

export default async function useDatabase(parentRouter: Router) {
  console.log('[route] useDatabase')
  const router = new Router();

  router.get('/',
    {middlewares: [requireUser]},
    $(async (req: Request<UserProps>) => {
      return listDbs(req.locals.user._id)
    }))

  router.post('/',
    {middlewares: [requireUser]},
    $(async (req: Request<UserProps>) => {
        const {alias} = await req.json();
        return createDb(req.locals.user._id, alias)
    }))

  router.delete('/:id',
    {middlewares: [requireUser]},
    $(async (req: Request<UserProps>) => {
      return removeDb(req.locals.user._id, DataParser.objectId(req.path_parameters.id))
    }));

  parentRouter.use('/database', router);
}



