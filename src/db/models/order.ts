import {ObjectId} from "mongodb";

export type IOrder = Partial<{
  _id: ObjectId;
  userId: ObjectId;
  configuration: string,
  region: string,
  plan: number,
  note: string,
  total: number,
  status: "queue" | "cancelled" | "rejected" | "inProgress" | "completed",
  logs: Record<string /*status at*/, Date>,
  createDt: Date
}>
