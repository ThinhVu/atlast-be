import {Request, Response, Router} from "hyper-express";
import {requireUser, UserProps} from "../middlewares/auth";
import {Model} from "../db/models";
import {FindOptions, Document} from 'mongodb';

export default async function useDatabase(parentRouter: Router) {
    console.log('[route] useDatabase')
    const router = new Router();

    router.get('/',{middlewares: [requireUser]}, async(req: Request<UserProps>, res: Response) => {
        const id = req.locals.user._id;
        return Model.Database.find({userId: id});
    })
}
