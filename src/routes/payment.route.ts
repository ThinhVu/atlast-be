import {Request, Router} from "hyper-express";
import {requireUser, UserProps} from "../middlewares/auth";
import $ from "../utils/safe-call";
//import {listDbs, createDb, removeDb} from "../logic/database";
import {getCurrentBalance, depositMoney, updateBalance, getPaymentHistory, updatePaymentHistory} from '../logic/payment'
import DataParser from "../utils/data-parser";

export default async function usePayment(parentRouter: Router) {
    console.log('[route] usePayment')
    const router = new Router();

    router.get('/',
        {middlewares: [requireUser]},
        $(async (req: Request<UserProps>) => {
            return getCurrentBalance(req.locals.user._id)
        }))

    router.post('/deposit',
        {middlewares: [requireUser]},
        $(async (req: Request<UserProps>) => {
            const {amount} = await req.json();
            return depositMoney(req.locals.user._id, amount)
        }))

    router.post('/',
        {middlewares: [requireUser]},
        $(async (req: Request<UserProps>) => {
            const {amount} = await req.json();
            return updateBalance(req.locals.user._id, amount)
        }))

    router.get('/history',
        {middlewares: [requireUser]},
        $(async (req: Request<UserProps>) => {
            return getPaymentHistory(req.locals.user._id)
        }))

    router.post('/history',
        {middlewares: [requireUser]},
        $(async (req: Request<UserProps>) => {
            const {value} = await req.json();
            return updatePaymentHistory(req.locals.user._id, value)
        }))

    parentRouter.use('/payment', router);
}