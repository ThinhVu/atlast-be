//import {requireAdmin} from "../middlewares/auth";
import {ApiProps, validKey} from "../middlewares/validate-key"
import hmmExecFactory from '@tvux/hmmjs';
import jsonFn from 'json-fn';
import {Request, Response} from "hyper-express"
import {Model} from "../db/models";
import {connectMongoClient} from "../plugins/mongodb";

const dbDriverCache = {}

export default async function userRunCommand(app) {
    console.log('[app-route] run-db-cmd')
    // json doesn't work well with date time, so we use bodyParser as raw just for hmm
    app.post('/run-db-cmd',
      {middlewares: [validKey]},
      async (req: Request<ApiProps>, res: Response) => {
        try {
            const {databaseId, key} = req.locals.dbApiKey;
            if (!dbDriverCache[key]) {
                const {username, password, dbName} = await Model.Database.findOne({_id: databaseId})
                const mongoClient = connectMongoClient({username, password, dbName})
                const db = mongoClient.db(dbName);
                dbDriverCache[key] = new Proxy({}, {
                    get(__, collectionName: string | symbol, ___): any {
                        return db.collection(collectionName as string)
                    }
                })
            }
            const hmm = hmmExecFactory(dbDriverCache[key]);
            const str = await req.text();
            const qry = jsonFn.parse(str, true);
            const rs = await hmm(qry)
            res.json(rs)
        } catch (e: any) {
            console.error('[run-db-cmd]', e)
            res.status(400).json({error: e.message})
        }
    })
}