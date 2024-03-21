import {IUser} from "../db/models/user";
import {ApiError} from "../utils/common-util";
import {EmailRegex} from "../constants/regex";
import {ObjectId} from "mongodb";
import {Model} from "../db/models";

// validation
export const isEmailValid = (email: string) => EmailRegex.test(email)
export const isEmailInvalid = (email: string) => !isEmailValid(email)
export const isEmailHaveBeenUsed = async (email: string): Promise<boolean> => (await Model.Users.countDocuments({email, emailVerified: true})) > 0;

export const validatePassword = (password: string) => {
  if (password.length < 9 || password.length > 20)
    throw new ApiError('E_006', 'invalid pwd')
}

export const defaultUserInfo = {
  // add more here
}

// create
export const createUser = async (data: IUser): Promise<IUser> => {
  const user: IUser = Object.assign({}, defaultUserInfo, data, {createdAt: new Date(), balance: 12})
  const {insertedId} = await Model.Users.insertOne(user);
  user._id = insertedId
  return user
};

// update
export const updateUser = async (_id: ObjectId, fieldsToUpdate: any): Promise<IUser> => {
  const {value: rs} = await Model.Users.findOneAndUpdate(
    {_id},
    fieldsToUpdate,
    {returnDocument: 'after', includeResultMetadata: true})
  return rs
};

// delete account
export const deleteAccountRequest = (_id: ObjectId, issueDate: Date): void => {
  Model.Users.updateOne({_id}, {$set: {deleteAccountRequest: {activated: true, issueDate}}}).catch(console.error)
}
export const cancelDeleteAccountRequest = (_id: ObjectId): void => {
  Model.Users.updateOne({_id}, {$set: {deleteAccountRequest: {activated: false, issueDate: null}}}).catch(console.error)
}
