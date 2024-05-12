import {ObjectId} from "mongodb";
import {Indexed} from "../../utils/types";

export type IUserBalanceHistory = Partial<{
  _id: ObjectId;
  uid: Indexed<ObjectId>;
  change: number;
  metadata: any;
  at: Date;
}>