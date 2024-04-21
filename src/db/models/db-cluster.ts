import {ObjectId} from 'mongodb';
import {Indexed} from "../../utils/types";

export type IDbCluster = Partial<{
  _id: ObjectId,
  userId: Indexed<ObjectId | undefined>, //ref: User._id
  name: string,
  desc: string,
  nodes: Array<string>,
  auth: {
    username: string,
    password: string
  },
  price: number; //
  createDt: Date
}>