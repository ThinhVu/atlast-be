import _ from 'lodash';
import dayjs from 'dayjs'
import bcrypt from 'bcrypt'
import $ from "../utils/safe-call"
import {Request, Router} from 'hyper-express';
import {rateLimitByIp} from "../middlewares/rate-limit";
import {requireUser, UserProps} from "../middlewares/auth";
import {ApiError} from "../utils/common-util";
import {randomNumberInRange} from "../utils/random-util";
import {delay, m2ms} from "../utils/date-time-util";
import {Model} from "../db/models";
import {defaultUserInfo} from "../logic/user";
import {volatileNotifyUser} from "../logic/notification";
import DataParser from "../utils/data-parser";
import {IVerification, VrfType} from "../db/models/verification";

async function initUser(uptimeByDay: number) {
   console.log('[dev-server] init user')
   const password = await bcrypt.hash('123ASD!@#', 10)
   let userIndex = 1;
   const now = dayjs()
   for (let i = uptimeByDay; i >= 0; i--) {
      const date = now.subtract(i, 'day').toDate()
      const beauDate = dayjs(date).format('YYYY-MM-DD')
      const newUsers = []
      for (let i = 0; i < randomNumberInRange(10, 20); ++i) {
         newUsers.push({
            email: `${userIndex}@x.yz`,
            emailVerified: true,
            phone: `84000000${userIndex.toString().padStart(3, '0')}`,
            phoneVerified: true,
            password: password,
            username: `u${Date.now() + Math.floor(Math.random() * 1000)}`,
            fullName: `Full Name ${userIndex}`,
            createdAt: date,
            ...defaultUserInfo,
            test: true
         })
         userIndex++;
      }
      console.log(beauDate, newUsers.length, 'new users')
      await Model.Users.insertMany(newUsers)
      await delay(100)
   }
   console.log('[dev-server] init user completed')
}

async function cleanup() {
   console.log('[dev-server] cleanup')
   await Model.Notifications.deleteMany({test: true})
   await Model.Users.deleteMany({test: true})
   await Model.Verifications.deleteMany({test: true})
}

export default async function useDevServer(parentRouter: Router) {
   if (!process.env.USE_DEV_SERVER) return
   console.log('[route] useDevServer')

   const router = new Router()
   router.post('/init', $(async (req) => {
      await cleanup()
      const {uptimeByDay} = await req.json()
      await initUser(Number(uptimeByDay || 10))
      return true
   }))

   router.get('/un-authorized', {
      middlewares: [requireUser]
   }, $(async () => {
      throw new ApiError("E_000", "Invalid user --", 401)
   }))

   router.get('/rate-limit-by-ip', {
      middlewares: [await rateLimitByIp({windowMs: m2ms(1), max: 2})]
   }, (req, res) => res.send('OK'))

   router.get('/rate-limit-by-user', {
      middlewares: [requireUser, await rateLimitByIp({windowMs: m2ms(1), max: 2})]
   }, (req, res) => res.send('OK'))

   router.get('/user/delete-account', {
      middlewares: [requireUser]
   }, $(async (req: Request<UserProps>) => {
      return Model.Users.deleteOne({_id: req.locals.user._id})
   }))

   router.get('/user/get-verification-code', $<IVerification>(async (req) => {
      const {email, phone} = req.query_parameters as {
         email: string,
         phone: string
      }
      if (_.isEmpty(email) && _.isEmpty(phone))
         throw new ApiError('E_001', 'missing "email" or "phone"')
      if (email)
         return Model.Verifications.findOne({target: email, type: VrfType.VerifyEmail});
      else
         return Model.Verifications.findOne({target: phone, type: VrfType.VerifyPhoneNr});
   }))

   router.post('/notification/echo', {
      middlewares: [requireUser]
   }, $(async (req: Request<UserProps>) => {
      return volatileNotifyUser([req.locals.user._id], 'hello', {from: null, data: {hi: 'mom'}})
   }))

   router.post('/notification/volatile-notify', $(async (req: Request) => {
      const {userIds, event, data} = await req.json()
      const userObjectIds = _.map(userIds, id => DataParser.objectId(id))
      return volatileNotifyUser(userObjectIds, event, data)
   }))

   parentRouter.use('/dev-server', router)
}
