import {Request, Router} from "hyper-express";
import {requireAdmin, requireUser, UserProps} from "../middlewares/auth";
import $ from "../utils/safe-call";
import DataParser from "../utils/data-parser";
import {
  getAllClusters, getMyCluster, getSharedCluster,
  create, update, remove,
} from "../logic/db-cluster";


export default async function useCluster(parentRouter: Router) {
  console.log('[route] useCluster')
  const router = new Router();

  router.get(
    '/all-clusters',
    {middlewares: [requireAdmin]},
    $(async (req: Request<UserProps>) => {
      return getAllClusters()
    })
  )

  router.get(
    '/shared',
    {middlewares: [requireUser]},
    $(async (req: Request<UserProps>) => {
      return getSharedCluster()
    })
  )

  router.get(
    '/mine',
    {middlewares: [requireUser]},
    $(async (req: Request<UserProps>) => {
      return getMyCluster(req.locals.user._id)
    })
  )

  router.post(
    '/',
    {middlewares: [requireAdmin]},
    $(async (req: Request<UserProps>) => {
      return create(await req.json())
    })
  )

  router.put(
    '/:id',
    {middlewares: [requireAdmin]},
    $(async (req: Request<UserProps>) => {
      return update(
        DataParser.objectId(req.path_parameters.id),
        await req.json()
      )
    })
  )

  router.delete(
    '/:id',
    {middlewares: [requireAdmin]},
    $(async (req: Request<UserProps>) => {
      return remove(DataParser.objectId(req.path_parameters.id))
    })
  )

  parentRouter.use('/cluster', router);
}
