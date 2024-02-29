import {ObjectId} from "mongodb";
import {Indexed} from "../../utils/types";

export type IUser = Partial<{
   _id: ObjectId
   email: Indexed<string>;
   emailVerified: boolean;
   password: string;
   createdAt: Indexed<Date>;
   fcm: string[];
   apn: string[];
   // extra info
   balance: number,
   // dev
   test: boolean;
}>