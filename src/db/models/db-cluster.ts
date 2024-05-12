import {ObjectId} from 'mongodb';
import {Indexed} from "../../utils/types";

export type IDbCluster = Partial<{
  _id: ObjectId,
  userId: Indexed<ObjectId | undefined>, //ref: User._id
  name: string,
  desc: string,
  dbHost: string,
  auth: {
    username: string,
    password: string
  },
  config: {
    replicaSet: string,
    w: string,
    readPreference: string,
  },
  price: number; //
  createDt: Date
}>