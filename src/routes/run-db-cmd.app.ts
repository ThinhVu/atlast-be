//import {requireAdmin} from "../middlewares/auth";
import {ApiProps, validKey} from "../middlewares/validate-key"
import hmmExecFactory from '@tvux/hmmjs';
import jsonFn from 'json-fn';
import {Request, Response} from "hyper-express"
import {Model} from "../db/models";
import {MongoClient} from "mongodb";

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
                const {username, password, name} = await Model.Database.findOne({_id: databaseId})
                const {DATABASE_HOST} = process.env
                const mongoClient = new MongoClient(`mongodb://${username}:${password}@${DATABASE_HOST}`)
                const db = mongoClient.db(name);
                dbDriverCache[key] = new Proxy({}, {
                    get(target: {}, p: string | symbol, receiver: any): any {
                        return db.collection(p as string)
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