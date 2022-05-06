import { MiscDataType, MiscType } from '@freestuffbot/common'
import { Request, Response } from 'express'
import Mongo from '../../../database/mongo'
import ReqError from '../../../lib/req-error'


export async function getConfig(req: Request, res: Response) {
  const config: MiscDataType = await Mongo.Misc
    .findById('config.global')
    .lean(true)
    .exec()
    .catch(() => {}) as any

  if (!config)
    return ReqError.badGateway(res)

  res.status(200).json(config?.data || {})
}


export async function patchConfig(req: Request, res: Response) {
  if (!req.body || typeof req.body !== 'object')
    return ReqError.badRequest(res, 'Invalid body', 'Yeah...')

  const config: MiscType = await Mongo.Misc
    .findById('config.global')
    .exec()
    .catch(() => {}) as any

  if (!config)
    return ReqError.badGateway(res)

  config.data = req.body

  config.save()
  res.status(200).json(config?.data || {})
}
