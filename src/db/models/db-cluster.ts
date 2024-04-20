import {ObjectId} from 'mongodb';
import {Indexed} from "../../utils/types";

export type IDbCluster = Partial<{
  _id: ObjectId,
  userId: Indexed<ObjectId | undefined>, //ref: User._id
  alias: string,
  nodes: Array<string>,
  price: number; //
  createDt: Date
}>