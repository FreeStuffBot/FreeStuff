import * as crypto from 'crypto'
import RabbitHole, { TaskId } from '@freestuffbot/rabbit-hole'
import { AppDataType, AppSanitizer, AppType } from '@freestuffbot/common'
import { Request, Response } from 'express'
import Mongo from '../../../database/mongo'
import ReqError from '../../../lib/req-error'
import AuditLog from '../../../lib/audit-log'


export async function getApp(_req: Request, res: Response) {
  const appId = res.locals.user?._id
  if (!appId) return ReqError.badRequest(res, 'User ID not found', 'Please log in.')

  const app: AppDataType = await Mongo.App
    .findById(appId)
    .lean(true)
    .exec()
    .catch(() => null)

  if (app === null)
    return ReqError.notFound(res, 'No app with the provided id found')

  if (!app)
    return ReqError.badGateway(res)

  const out = AppSanitizer.sanitize(app)

  res.status(200).json(out || {})
}


export async function postApp(_req: Request, res: Response) {
  const appId = res.locals.user?._id
  if (!appId) return ReqError.badRequest(res, 'User ID not found', 'Please log in.')

  const exists: boolean = await Mongo.App
    .exists({ _id: appId })

  if (exists) return ReqError.badRequest(res, 'App already exists', 'App already exists.')

  const document = new Mongo.App({
    _id: appId,
    type: 'basic',
    key: generateKey(res.locals.user.data.id),
    description: 'I\'m using it for: \nYou can find more information at: \nAdditional information: ',
    webhookUrl: '',
    webhookSecret: '',
    lcKey: getTimestamp(), // last changed
    lcWebhookUrl: getTimestamp(),
    lcWebhookVersion: getTimestamp()
  }) as AppType

  await document.save()
  res.status(200).json({})

  AuditLog.record({
    event: 'api_app_new',
    author: appId
  })
}


export async function postAppKeyRegen(_req: Request, res: Response) {
  const appId = res.locals.user?._id
  if (!appId) return ReqError.badRequest(res, 'User ID not found', 'Please log in.')

  const app: AppType = await Mongo.App
    .updateOne(
      { _id: appId },
      {
        $set: {
          key: generateKey(appId),
          lc_key: getTimestamp()
        }
      })
    .lean(true)
    .exec()
    .catch(() => null)

  AuditLog.record({
    event: 'api_key_regen',
    author: appId
  })

  res.status(app ? 200 : 400).json({})
}


export async function patchAppWebhook(req: Request, res: Response) {
  const appId = res.locals.user?._id
  if (!appId) return ReqError.badRequest(res, 'User ID not found', 'Please log in.')

  const url = (req?.body?.url || '') + ''
  const secret = (req?.body?.secret || '') + ''

  if (url) {
    const error = validateWebhookDetails(url, secret)
    if (error) return ReqError.badRequest(res, 'Invalid Webhook Config', error)
  }

  const app: AppType = await Mongo.App
    .updateOne(
      { _id: appId },
      {
        $set: {
          webhookUrl: url,
          webhookSecret: secret,
          lcWebhookUrl: getTimestamp()
        }
      })
    .lean(true)
    .exec()
    .catch(() => null)

  AuditLog.record({
    event: 'api_webhook_update',
    author: appId
  })

  res.status(app ? 200 : 400).json({})
}


export async function postAppWebhookTest(_req: Request, res: Response) {
  const appId = res.locals.user?._id
  if (!appId) return ReqError.badRequest(res, 'User ID not found', 'Please log in.')

  const app = await Mongo.App
    .findById(appId)
    .lean(true)
    .exec()
    .catch(() => null) as AppDataType

  if (app === null)
    return ReqError.notFound(res, 'No app with the provided id found')

  if (!app)
    return ReqError.badGateway(res)

  RabbitHole.publish({
    t: TaskId.APPS_TEST,
    i: app._id
  })

  AuditLog.record({
    event: 'api_webhook_test',
    author: appId
  })

  res.status(200).json({})
}


export async function patchAppDescription(req: Request, res: Response) {
  const appId = res.locals.user?._id
  if (!appId) return ReqError.badRequest(res, 'User ID not found', 'Please log in.')

  let description = req.body.text + ''
  if (description.length > 2048)
    description = description.substring(0, 2048)

  const app: AppType = await Mongo.App
    .updateOne(
      { _id: appId },
      {
        $set: { description }
      })
    .lean(true)
    .exec()
    .catch(() => null)

  AuditLog.record({
    event: 'api_description_update',
    author: appId
  })

  res.status(app ? 200 : 400).json({})
}

//

function generateKey(appid: string): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let out = ''
  let it = 24
  while (it-- > 0) out += chars[Math.floor(Math.random() * chars.length)]

  const appIdEncoded = Buffer.from(appid).toString('base64')
  const hash = crypto.createHash('md5').update(`${appIdEncoded}.${out}`).digest('hex').substring(0, 4)

  return `${appIdEncoded}.${out}.${hash}`
}

function getTimestamp(): number {
  return ~~(Date.now() / 1000)
}

/** returns null if valid or error message otherwise */
function validateWebhookDetails(url: string, secret: string): string | null {
  if (!/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/.test(url))
    return 'The url provided is not valid. [ec1]'

  if (url.length > 1024)
    return 'The url provided has to be of 1024 characters or less in length. [ec2]'

  const host = new URL(url).hostname
  if (host === 'localhost' || host.startsWith('127.0.') || host.endsWith(':1') || host.endsWith(':1]') || host.startsWith('10.'))
    return 'The url provided is not valid. [ec3]'

  if (secret.length > 64)
    return 'The secret has to be of 64 characters or less. [ec4]'

  return null
}
