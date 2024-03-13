import {ObjectId} from "mongodb";
import {Indexed} from "../../utils/types";

export type IWebhook = Partial<{
    _id: ObjectId;
    userId: Indexed<ObjectId>;
    dbName: string;
    //database contain collections that they want to watch the changes
    colName: string;
    //collection that they want to watch the changes
    to: string; //link to user api;
    operationType: string; //let user choose what type in CRUD that they want.
    //if they don't choose, that mean they want all CRUD
    createDt: Date; //the day user register the webhook service
}>