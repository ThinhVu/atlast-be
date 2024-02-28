//import {requireAdmin} from "../middlewares/auth";
import {validKey} from "../middlewares/validate-key"
import hmmExecFactory from '@tvux/hmmjs';
import jsonFn from 'json-fn';
import {Request, Response} from "hyper-express"
import {Model} from "../db/models";
import {MongoClient,Db} from "mongodb";


let client: MongoClient, db: Db
export default async function userRunCommand(app) {
    if (!process.env.USE_RUN_DB_CMD) return
    console.log('[app-route] run-db-cmd')
    // json doesn't work well with date time, so we use bodyParser as raw just for hmm
    app.post('/run-db-cmd', {middlewares: [validKey]}, async (req: Request, res: Response) => {
        const {collections} = await Model.Database.findOne({_id: req.locals.api.databaseId})
        db = client.db(req.locals.api.dbName)
        const cols ={}
        //get collection of database that user want to connect
        for (const col in collections) {
            const key = collections[col];
            cols[key] = db.collection(key);
        }
        const hmm = hmmExecFactory({cols});
        const str = await req.text();
        const qry = jsonFn.parse(str, true);
        const rs = await hmm(qry)
        res.json(rs)
    })
}