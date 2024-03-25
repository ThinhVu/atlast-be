import {Request, Router} from "hyper-express";
import {requireUser, UserProps} from "../middlewares/auth";
import $ from "../utils/safe-call";
import {getDbCollection, createNewCollection} from "../logic/explore";
import DataParser from "../utils/data-parser";


export default async function useExplore(parentRouter: Router) {
    console.log('[route] useExplore')
    const router = new Router();
    router.get('/:id',
        {middlewares: [requireUser]},
        $(async (req: Request<UserProps>) => {
            return getDbCollection(req.locals.user._id, DataParser.objectId(req.path_parameters.id))
        }));

    router.post('/:id',
        {middlewares: [requireUser]},
        $(async (req: Request<UserProps>) => {
            const {colName} = await req.json();
            return createNewCollection(req.locals.user._id, DataParser.objectId(req.path_parameters.id), colName)
        }));
    parentRouter.use('/explore', router);
}
