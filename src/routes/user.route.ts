import _ from "lodash";
import dayjs from "dayjs";
import bcrypt from 'bcrypt';
import {
  cancelDeleteAccountRequest,
  createUser,
  deleteAccountRequest,
  isEmailHaveBeenUsed,
  isEmailInvalid,
  updateUser,
  validatePassword
} from '../logic/user';
import {ApiError} from "../utils/common-util";
import {VrfType} from "../db/models/verification";
import {genToken, parseAuthorization} from "../utils/auth-util";
import {buildEmailPayload, sendEmail} from "../utils/email-util";
import {Router, Request} from 'hyper-express';
import $ from "../utils/safe-call";
import {requireUser, UserProps} from "../middlewares/auth";
import i18n from "../i18n";
import {rateLimitByIp, rateLimitByUser} from "../middlewares/rate-limit";
import {IUser} from "../db/models/user";
import {randomNumberInRange} from "../utils/random-util";
import {m2ms} from "../utils/date-time-util";
import {Model} from "../db/models";

interface CreateVerifyCodeResult {
  issueDate: Date,
  expiredDate: Date
}

function generateCode(): string {
  return randomNumberInRange(1111, 9999).toString();
}

export default async function useUser(parentRouter: Router) {
  console.log('[route] useUser')
  const router = new Router();

  //region Auth
  type AuthResponse = {
    user: IUser,
    token: string
  }
  router.post('/sign-up', {
    middlewares: [await rateLimitByIp({windowMs: m2ms(10), max: 60})]
  }, $<AuthResponse>(async (req, res) => {
    const {email, password} = await req.json();
    if (_.isEmpty(email)) throw new ApiError('E_015', 'missing email')
    if (_.isEmpty(password)) throw new ApiError('E_002', 'missing pwd')
    if (isEmailInvalid(email)) throw new ApiError('E_003', 'invalid email')
    if (await isEmailHaveBeenUsed(email)) throw new ApiError('E_004', 'email existed')
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await createUser({email, password: passwordHash})
    const token = genToken(user)
    res.cookie('token', token)
    return {user, token}
  }))

  router.post('/sign-in', {
    middlewares: [await rateLimitByIp({windowMs: m2ms(10), max: 60})]
  }, $<AuthResponse>(async (req, res) => {
    const {email, password} = await req.json()
    if (_.isEmpty(email)) throw new ApiError('E_001', 'missing email/phone')
    if (_.isEmpty(password)) throw new ApiError('E_002', 'missing pwd')
    const qry = {email}
    const user: IUser = await Model.Users.findOne(qry);
    if (!user) throw new ApiError('E_010', 'invalid account')
    const isCorrectPasswd = await bcrypt.compare(password, user.password)
    if (!isCorrectPasswd) throw new ApiError('E_018', 'wrong password')
    const token = genToken(user)
    res.cookie('token', token)
    return {user, token}
  }));

  router.post('/oauth', {
    middlewares: [await rateLimitByIp({windowMs: m2ms(10), max: 60})]
  }, $<AuthResponse | {
    mode: string
  }>(async (req, res) => {
    const payload = await req.json()
    const {ProviderId} = payload
    switch (ProviderId) {
      case "firebase":
      case "google.com": {
        const {UserId, Email} = payload;
        const OAuthUserId = _.trim(UserId)
        const email = _.trim(Email)
        if (_.isEmpty(email)) throw new ApiError('E_000', 'missing email')
        if (isEmailInvalid(email)) throw new ApiError('E_003', 'invalid email')
        let mode: string;
        let user: IUser = await Model.Users.findOne({OAuthProvider: ProviderId, OAuthUserId})
        if (user) {
          mode = 'signIn'
        } else {
          user = await createUser({
            email,
            emailVerified: !!email,
            password: await bcrypt.hash(OAuthUserId, 10),
            OAuthProvider: ProviderId,
            OAuthUserId
          })
          mode = 'signUp'
        }
        const token = genToken(user)
        res.cookie('token', token)
        return {user, token, mode}
      }
      default:
        throw new ApiError("E_000", 'not supported provider')
    }
  }))

  router.get('/auth', {
    middlewares: [await rateLimitByIp({windowMs: m2ms(10), max: 60})]
  }, $<AuthResponse>(async (req, res) => {
    const authData = parseAuthorization(req)
    const {email, password} = authData.user
    const qry = {email, password}
    const user = await Model.Users.findOne(qry);
    if (!user)
      throw new ApiError('E_010', 'invalid account')
    const token = genToken(user)
    res.cookie('token', token)
    return {user, token}
  }));

  router.post('/sign-out', {
    middlewares: [requireUser, await rateLimitByIp({windowMs: m2ms(10), max: 60})]
  }, $<boolean>(async (req: Request<UserProps>, res) => {
    if (req.cookies['token'])
      res.clearCookie('token')
    return true
  }))
  //endregion

  //region Password
  router.post('/change-password', {
    middlewares: [await rateLimitByIp({windowMs: m2ms(10), max: 60})]
  }, $<AuthResponse>(async (req, res) => {
    const {
      newPassword, // required field
      email, password, // normal flow
      ProviderId, UserId // oauth flow
    } = await req.json();
    validatePassword(newPassword)
    const newPasswordHash = await bcrypt.hash(newPassword, 10)
    let user;
    if (ProviderId) {
      user = await Model.Users.findOne({
        OAuthProvider: ProviderId,
        OAuthUserId: _.trim(UserId)
      })
      if (!user) throw new ApiError('E_010')
      await Model.Users.updateOne({_id: user._id}, {$set: {password: newPasswordHash}})
    } else {
      if (_.isEmpty(email)) throw new ApiError('E_001', 'missing email/phone')
      const userQry = {email}
      user = await Model.Users.findOne(userQry);
      if (!user) throw new ApiError('E_010')
      const isPasswdCorrect = await bcrypt.compare(password, user.password)
      if (!isPasswdCorrect) throw new ApiError('E_018')
      await Model.Users.updateOne({_id: user._id}, {$set: {password: newPasswordHash}})
    }
    user.password = newPasswordHash;
    const authToken = genToken(user)
    res.cookie('token', authToken)
    return {user, token: authToken}
  }))

  const upsertResetPasswordVerifyCode = async ({locale, email}): Promise<CreateVerifyCodeResult> => {
    const code = generateCode();
    const issueDate = new Date()
    const expiredDate = dayjs().add(5, 'minute').toDate()
    const i18nMessage = i18n[locale] || i18n['vi'];
    await sendEmail(buildEmailPayload({
      to: email,
      subject: i18nMessage["ResetPassword_Subject"],
      content: i18nMessage["ResetPassword_Content"].replace('{{user}}', email).replace('{{code}}', code)
    }))
    await Model.Verifications.updateOne({
      type: VrfType.ResetPasswordByEmail,
      target: email,
    }, {$set: {
        code,
        issueDate,
        expiredDate
      }}, {upsert: true})
    return {issueDate, expiredDate}
  };
  router.post('/forgot-password', {
    middlewares: [await rateLimitByIp({windowMs: m2ms(10), max: 60})]
  }, $(async (req) => {
    const {email} = await req.json()
    if (_.isEmpty(email))
      throw new ApiError('E_001', 'missing email/phone')
    const userQry = {email}
    const user = await Model.Users.findOne(userQry);
    if (!user) throw new ApiError('E_000', 'User not found')
    const vrfQry = {target: email, type: VrfType.ResetPasswordByEmail}
    const vrf = await Model.Verifications.findOne(vrfQry);
    if (!vrf || dayjs(vrf.expiredDate).isBefore(dayjs())) {
      const respData = await upsertResetPasswordVerifyCode({locale: 'en_us', email})
      return {sent: true, ...respData}
    } else {
      return {sent: true, issueDate: new Date(), expiredDate: vrf.expiredDate}
    }
  }))

  router.post('/reset-password', {
    middlewares: [await rateLimitByIp({windowMs: m2ms(10), max: 60})]
  }, $<AuthResponse>(async (req, res) => {
    const {password, code, email} = await req.json();
    if (_.isEmpty(email)) throw new ApiError('E_001', 'missing email/phone')
    if (_.isEmpty(password)) throw new ApiError('E_002', 'missing pwd')
    if (_.isEmpty(code)) throw new ApiError('E_008', 'missing code')
    const qry = {email}
    let user = await Model.Users.findOne(qry);
    if (!user) throw new ApiError('E_000', 'Invalid email')
    const vrfQry = {type: VrfType.ResetPasswordByEmail, target: email, code}
    const vrf = await Model.Verifications.findOne(vrfQry);
    if (!vrf)
      throw new ApiError('E_009', 'email/phone not verified')
    if (dayjs(vrf.expiredDate).isBefore(dayjs()))
      throw new ApiError('E_011', 'verification code expired')
    const passwordHash = await bcrypt.hash(password, 10)
    const updateUserRs = await Model.Users.findOneAndUpdate(
      {_id: user._id},
      {$set: {password: passwordHash}},
      {returnDocument: 'after', includeResultMetadata: true})
    user = updateUserRs.value
    await Model.Verifications.deleteOne({_id: vrf._id})
    const authToken = genToken(user)
    res.cookie('token', authToken)
    return {user, token: authToken}
  }))
  //endregion

  //region AccountSearch
  router.get('/profile', {
    middlewares: [
      requireUser,
      await rateLimitByUser({windowMs: m2ms(10), max: 60})
    ]
  }, $<IUser>(async (req: Request<UserProps>) => {
    const user : IUser = await Model.Users.findOne(
      {_id: req.locals.user._id},
      {projection: {password: 0}}
    )
    return user
  }))
  //endregion

  //region delete information
  router.post('/delete-account-request', {
    middlewares: [requireUser, await rateLimitByUser({windowMs: m2ms(10), max: 60})]
  }, $(async (req: Request<UserProps>) => {
    const issueDate = dayjs(new Date()).add(14, 'day').toDate()
    deleteAccountRequest(req.locals.user._id, issueDate)
    return issueDate
  }))

  router.post('/cancel-delete-account-request', {
    middlewares: [requireUser, await rateLimitByUser({windowMs: m2ms(10), max: 60})]
  }, $(async (req: Request<UserProps>) => {
    cancelDeleteAccountRequest(req.locals.user._id)
    return true
  }))
  //endregion

  parentRouter.use('/user', router)
}
