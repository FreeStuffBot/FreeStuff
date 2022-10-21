import { NotificationType } from '@freestuffbot/common'
import { Request, Response } from 'express'
import { Types } from 'mongoose'
import Mongo from '../../database/mongo'
import ReqError from '../../lib/req-error'


export async function postNotificationRead(req: Request, res: Response) {
  const user = res.locals.user
  if (!user) return ReqError.internalServerError(res)

  const notifId = req.params.notification

  let objId = null
  try {
    objId = new Types.ObjectId(notifId + '')
  } catch (ex) {
    return ReqError.badRequest(res, 'invalid_id', 'Not even the right schema wtf')
  }

  const obj = await Mongo.Notification
    .findById(objId)
    .exec()
    .catch(() => 0) as NotificationType

  if (obj as any === 0) return ReqError.badGateway(res)
  if (!obj) return ReqError.notFound(res)

  if (obj.recipient !== user.id) return ReqError.noAccess(res)
  if (obj.readAt) return res.status(200).end()

  obj.readAt = Date.now()
  obj.save()
  res.status(200).end()
}
