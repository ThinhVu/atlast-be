import {Request, Router} from "hyper-express";
import {requireUser, UserProps} from "../middlewares/auth";
import $ from "../utils/safe-call";
import {listUserApi, registerNewUserWebhook, updateUserWebhook, deleteUserWebhook} from "../logic/user-webhook";
import DataParser from "../utils/data-parser";

export default async function useUserWebhook(parentRouter: Router) {
    console.log('[route] useUserWebhook')
    const router = new Router();

    router.get('/',
        {middlewares: [requireUser]},
        $(async (req: Request<UserProps>) => {
            return listUserApi(req.locals.user._id)
        }))

    router.post('/',
        {middlewares: [requireUser]},
        $(async (req: Request<UserProps>) => {
            const data = await req.json();
            return registerNewUserWebhook(req.locals.user._id, data)
        }))

    router.post('/:id',
        {middlewares: [requireUser]},
        $(async (req: Request<UserProps>) => {
            const change = await req.json();
           return updateUserWebhook(req.locals.user._id, DataParser.objectId(req.path_parameters.id), change)
        }))

    router.delete('/:id',
        {middlewares: [requireUser]},
        $(async (req: Request<UserProps>) => {
            return deleteUserWebhook(req.locals.user._id, DataParser.objectId(req.path_parameters.id))
        }))

    parentRouter.use('/user-webhook', router);
}
