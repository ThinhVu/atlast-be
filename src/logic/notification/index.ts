import _ from 'lodash';
import {ObjectId} from "mongodb";
import {INotification} from "../../db/models/notification";
import {getLogger} from "../../utils/logger";
import {Model} from "../../db/models";

export const seenNotifies = async (userId: ObjectId, notifyIds: ObjectId[]) => {
   return Model.Notifications.deleteMany({_id: {$in: notifyIds}, to: userId})
}

export const getUnseenNotifies = async (userId: ObjectId): Promise<any> => {
   return Model.Notifications.find({to: userId, seen: false}).toArray()
}

export const saveNotify = async (to: ObjectId[], event: string, metadata: any): Promise<INotification> => {
   const noti: INotification = {to, event, metadata, at: new Date(), seen: false}
   const {insertedId} = await Model.Notifications.insertOne(noti)
   noti._id = insertedId
   return noti
}

export const notifyUser = async (to: ObjectId[], event: string, data: INotificationData) => {
   const noti = await saveNotify(to, event, data)
   const notifyId = noti._id.toString()
   return notify(notifyId, to, event, data)
}

type INotificationData = {
   from?: ObjectId | undefined,
   data?: any
}
export const volatileNotifyUser = async (to: ObjectId[], event: string, data: INotificationData) => {
   return notify("", to, event, data)
}

async function notify(
  notifyId: string,
  to: ObjectId[],
  event: string,
  data: INotificationData)
{
   let users = await Model.Users.find({_id: {$in: to}, 'notificationSetting.allow': true}).toArray()
   if (_.isEmpty(users)) return

   let error;
   const userIds = users.map(u => u._id)
   for (const userId of userIds) {
      try {
         global.io.of('/app').toUser(userId.toString()).emit(event, notifyId, JSON.stringify(data))
      } catch (e) {
         if (!error) error = e;
      }
   }
   // just log the first error
   if (error) getLogger().error(error.message)
}
