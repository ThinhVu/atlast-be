import uuid from 'time-uuid';
import {ObjectId} from "mongodb";
import {Model} from "../db/models";
import {IDatabase} from "../db/models/database";
import {getClusterConnectionFactory} from "./db-connection-factory";

export async function listDbs(userId: ObjectId) {
  return Model.Database.find({userId}).toArray()
}

export async function createDb(userId: ObjectId, alias: string, clusterId: ObjectId) {
  const cluster = await Model.DbCluster.findOne({_id: clusterId})
  if (!cluster) throw new Error("Cluster is not exist");

  const timestampId = uuid();
  const dbName = `${timestampId}${userId}`;
  const username = timestampId;
  const password = Date.now().toString();
  const createDt = new Date();

  const {auth, dbHost} = cluster
  const ccf = getClusterConnectionFactory(clusterId.toString())
  const client = ccf.connectMongoClient({
    dbHost,
    dbName: 'admin',
    username: auth.username,
    password: auth.password,
    config: {
      authSource: 'admin',
    }
  })
  const db = client.db(dbName);
  await db.command({
    createUser: username,
    pwd: password,
    roles:[
      { role: "dbOwner", db: dbName }
    ]
  })
  await db.createCollection('info');
  await db.collection('info').insertOne({alias, createDt})

  const doc: IDatabase = {
    userId,
    clusterId,
    alias,
    dbName,
    username: timestampId,
    password: Date.now().toString(),
    sizeInGB: 0,
    createDt,
  }
  const {insertedId} = await Model.Database.insertOne(doc)
  doc._id = insertedId
  return doc;
}

export async function removeDb(userId: ObjectId, dbId: ObjectId) {
  const dbInfo = await Model.Database.findOne({_id: dbId}, {projection: {dbName: 1}});
  if (!dbInfo) throw new Error("User doesn't own db");
  const cluster = await Model.DbCluster.findOne({_id: dbInfo.clusterId})
  if (!cluster) throw new Error("Cluster is not exist");
  const {auth, dbHost} = cluster;
  const ccf = getClusterConnectionFactory(cluster._id.toString())
  const client = ccf.connectMongoClient({
    dbHost,
    dbName: 'admin',
    username: auth.username,
    password: auth.password,
    config: {
      authSource: 'admin',
    }
  })
  const db = client.db(dbInfo.dbName);
  await db.dropDatabase();
  await Model.DbWebhook.deleteMany({dbName: dbInfo.dbName});
  await Model.Database.deleteOne({_id: dbId, userId});
}

export async function throwIfUserDoesNotOwnDb(userId: ObjectId, dbId: ObjectId) {
  const count = await Model.Database.countDocuments({_id: dbId, userId})
  if (count === 1) return true
  throw new Error("User doesn't own db")
}