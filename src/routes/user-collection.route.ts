import {Request, Router} from "hyper-express";
import {requireUser, UserProps} from "../middlewares/auth";
import $ from "../utils/safe-call";
import {createNewDoc, deleteDoc, updateDoc, getDocs} from "../logic/user-collection";
import DataParser from "../utils/data-parser";


export default async function useUserCol(parentRouter: Router) {
  console.log('[route] useUserCol')
  const router = new Router();

  router.get('/:dbId/:col/:page',
    {middlewares: [requireUser]},
    $(async (req: Request<UserProps>) => {
      const userId = req.locals.user._id
      const dbId = DataParser.objectId(req.path_parameters.dbId)
      const colName = DataParser.str(req.path_parameters.col)
      const page = DataParser.number(req.path_parameters.page,1)
      return getDocs(userId, dbId, colName, page)
    }));

  router.post('/:dbId/:col',
    {middlewares: [requireUser]},
    $(async (req: Request<UserProps>) => {
      const doc = req.json()
      const userId = req.locals.user._id
      const dbId = DataParser.objectId(req.path_parameters.dbId)
      const colName = DataParser.str(req.path_parameters.col)
      return createNewDoc(userId, dbId, colName, doc)
    }));

  router.post('/dbId/:col/:id',
    {middlewares: [requireUser]},
    $(async (req: Request<UserProps>) => {
      const doc = req.json()
      const userId = req.locals.user._id
      const dbId = DataParser.objectId(req.path_parameters.dbId)
      const colName = DataParser.str(req.path_parameters.col)
      const id = DataParser.objectId(req.path_parameters.id)
      return updateDoc(userId, dbId, colName, id, doc)
    }));

  router.delete('/dbId/:col/:id',
    {middlewares: [requireUser]},
    $(async (req: Request<UserProps>) => {
      const userId = req.locals.user._id
      const dbId = DataParser.objectId(req.path_parameters.dbId)
      const colName = DataParser.str(req.path_parameters.col)
      const id = DataParser.objectId(req.path_parameters.id)
      return deleteDoc(userId, dbId, colName, id)
    }));

  parentRouter.use('/user-collection', router);
}
