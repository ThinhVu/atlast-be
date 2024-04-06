import {ObjectId} from "mongodb";
import {Indexed} from "../../utils/types";

export type IDbWebhook = Partial<{
    _id: ObjectId;
    dbName: Indexed<string>;
    colName: Indexed<string>; //collection that they want to watch the changes
    desc: string;
    to: string; //link to user api;
    createDt: Date; //the day user register the webhook service
    enable: boolean;
}>