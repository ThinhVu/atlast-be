import {ObjectId} from "mongodb";

export type INodeConfiguration = Partial<{
  _id: ObjectId;
  text: string,
  code: string,
  price: number,
  createDt: Date
}>
