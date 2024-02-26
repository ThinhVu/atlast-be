import {ApiError} from "../utils/common-util";
import {parseAuthorization} from "../utils/auth-util";
import To from "../utils/data-parser";
import {ObjectId} from "mongodb";
import {type Request, type Response, type MiddlewareNext} from "hyper-express";
import {Model} from "../db/models";

interface Ivalid {
    value: String,
    enable: Boolean,
    databaseId: ObjectId,
}

interface ApiProps {
    api: Ivalid
}
export function validKey(req:Request<ApiProps>,res:Response,next:MiddlewareNext){
    //get api key of user
    const apiKey = req.headers['api-key'];
    Model.API.findOne({value: apiKey}).then(async api => {
        if (!api) {
            //check if apiKey is existed or not
            console.log("API key doesn't exist!")
        } else if (api.enable == false) {
            //check if apiKey is enabled or not
            console.log("API key wasn't enabled")
        } else {
            //if apiKey is existed and enable then
            //get database name
            const dataId = api.databaseId
            const {name} = await Model.Database.findOne({_id: dataId})
            return name
            //add connection to client
        }
        next()
    })
}