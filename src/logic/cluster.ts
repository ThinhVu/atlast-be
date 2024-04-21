import {ObjectId} from "mongodb";
import {IDbCluster} from "../db/models/db-cluster";
import {Model} from "../db/models";

export async function getAllClusters(): Promise<Array<IDbCluster>> {
  return Model.DbCluster.find({}, {projection: {auth: -1}}).toArray()
}

export async function getSharedCluster() {
  return Model.DbCluster.find({userId: { $exists: false }}, {projection: {auth: -1}}).toArray()
}

export async function getMyCluster(uid: ObjectId) {
  return Model.DbCluster.find({userId: uid}, {projection: {auth: -1}}).toArray()
}

export async function create(payload: IDbCluster) {
  return Model.DbCluster.insertOne(payload)
}

export async function update(_id: ObjectId, change: IDbCluster) {
  return Model.DbCluster.updateOne({_id}, {$set: change})
}

export async function remove(_id: ObjectId) {
  return Model.DbCluster.deleteOne({_id})
}