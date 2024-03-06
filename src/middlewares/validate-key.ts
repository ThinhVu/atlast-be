import {ApiError} from "../utils/common-util";
import {type Request, type Response, type MiddlewareNext} from "hyper-express";
import {Model} from "../db/models";
import {IDbApiKey} from "../db/models/db-api-key";

export interface ApiProps {
    dbApiKey: IDbApiKey
}
export function validKey( req: Request<ApiProps>, res: Response, next: MiddlewareNext){
    //get api key of user
    const apiKey = req.headers['api-key'];
    Model.DbApiKey.findOne({key: apiKey, enable: true}).then(async doc => {
        if (!doc) {
            next(new ApiError("E_000", "Invalid API key", 401))
            return
        }
        if (req.locals)
            req.locals.dbApiKey = doc
        else
            req.locals = { dbApiKey: doc }
        next()
    }).catch(e => next(e))
}