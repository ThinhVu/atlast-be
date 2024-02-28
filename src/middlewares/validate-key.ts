import {ApiError} from "../utils/common-util";
import {parseAuthorization} from "../utils/auth-util";
import To from "../utils/data-parser";
import {ObjectId} from "mongodb";
import {type Request, type Response, type MiddlewareNext} from "hyper-express";
import {Model} from "../db/models";

interface IValid {
    key: String,
    enable: Boolean,
    databaseId: ObjectId,
    dbName: String,
}

interface ApiProps {
    api: IValid
}
export function validKey( req: Request<ApiProps>, res: Response, next: MiddlewareNext){
    //get api key of user
    const apiKey = req.headers['api-key'];
    Model.DbApiKey.findOne({key: apiKey, enable: true}).then(async api => {
        if (!api) {
            next(new ApiError("E_000", "Invalid API key", 401))
            return
        }
        const databaseId = api.databaseId
        const {name} = await Model.Database.findOne({_id: databaseId})
        const authDbApi = {
            key: apiKey,
            databaseId: databaseId,
            enable: true,
            dbName: name,
        }
        if (req.locals)
            req.locals.api = authDbApi
        else
            req.locals = { api: authDbApi }
        next()
    }).catch(e => next(new ApiError("E_000", "Invalid API key", 401)))
}