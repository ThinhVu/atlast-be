import {ObjectId} from "mongodb";
import {Model} from "../db/models";
import {v4} from "uuid"
import {delay} from "../utils/date-time-util";

export async function lists(databaseId: ObjectId) {
  return Model.DbApiKey.find({databaseId}).toArray()
}

export async function create(databaseId: ObjectId) {
  let key = v4()
  while (await Model.DbApiKey.countDocuments({key}) > 0) {
    key = v4()
    await delay(100)
  }
  return Model.DbApiKey.insertOne({
    key,
    databaseId,
    enable: true,
    createDt: new Date()
  })
}

export async function update(databaseId: ObjectId, apiKey: string, change: any) {
  return Model.DbApiKey.updateOne({databaseId, key: apiKey}, change)
}

export async function remove(databaseId: ObjectId, apiKey: string) {
  return Model.DbApiKey.deleteOne({databaseId, key: apiKey})
}