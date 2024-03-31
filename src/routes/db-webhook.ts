import {Request, Router} from "hyper-express";
import {requireUser, UserProps} from "../middlewares/auth";
import $ from "../utils/safe-call";
import {listDbWebHook, createDbWebHook, updateDbWebHook, deleteDbWebHook, watchCollection} from "../logic/db-webhook";
import DataParser from "../utils/data-parser";

export default async function useDbWebhook(parentRouter: Router) {
    console.log('[route] useDbWebhook')
    const router = new Router();

    watchCollection()

    router.get('/:dbId',
        {middlewares: [requireUser]},
        $(async (req: Request<UserProps>) => {
            return listDbWebHook(DataParser.objectId(req.path_parameters.dbId))
        }))

    router.post('/:dbId',
        {middlewares: [requireUser]},
        $(async (req: Request<UserProps>) => {
            const data = await req.json();
            return createDbWebHook(DataParser.objectId(req.path_parameters.dbId), data)
        }))

    router.post('/:dbId/:id',
        {middlewares: [requireUser]},
        $(async (req: Request<UserProps>) => {
            const {to} = await req.json();
            return updateDbWebHook(DataParser.objectId(req.path_parameters.id), to)
        }))

    router.delete('/:id',
        {middlewares: [requireUser]},
        $(async (req: Request<UserProps>) => {
            return deleteDbWebHook(DataParser.objectId(req.path_parameters.id))
        }))

    parentRouter.use('/db-webhook', router);
}
