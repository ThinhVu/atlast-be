//import {requireAdmin} from "../middlewares/auth";
import {validKey} from "../middlewares/validate-key"
import hmmExecFactory from '@tvux/hmmjs';
import jsonFn from 'json-fn';
import {Request, Response} from "hyper-express"
import {Model} from "../db/models";

export default async function endUserExecute(app) {
    if (!process.env.USE_HMM_API) return

    console.log('[app-route] end-user-execute-command')
    const endUserHmm = hmmExecFactory({
        user: Model.Users,
        // add more models as you want
    })
    // json doesn't work well with date time, so we use bodyParser as raw just for hmm
    app.post('/end-user-hmm', {middlewares: [validKey]}, async (req: Request, res: Response) => {
        const str = await req.text();
        const qry = jsonFn.parse(str, true);
        const rs = await endUserHmm(qry)
        res.json(rs)
    })
}