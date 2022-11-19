import { MiscDataType, MiscType } from '@freestuffbot/common'
import { Request, Response } from 'express'
import Mongo from '../../../database/mongo'
import AuditLog from '../../../lib/audit-log'
import ReqError from '../../../lib/req-error'


const configs = {
  'global': 'config.global',
  'service-composition': 'config.service-composition'
}


export async function getConfig(req: Request, res: Response) {
  const name = req.params.config
  const dbName = configs[name]
  if (!dbName)
    return ReqError.badRequest(res, 'Invalid config', `Config ${name} not found!`)

  const config: MiscDataType = await Mongo.Misc
    .findById(dbName)
    .lean(true)
    .exec()
    .catch(() => null) as any

  if (!config)
    return ReqError.badGateway(res)

  res.status(200).json(config?.data || {})
}


export async function patchConfig(req: Request, res: Response) {
  if (!req.body || typeof req.body !== 'object')
    return ReqError.badRequest(res, 'Invalid body', 'Yeah...')

  const name = req.params.config
  const dbName = configs[name]
  if (!dbName)
    return ReqError.badRequest(res, 'Invalid config', `Config ${name} not found!`)

  const config: MiscType = await Mongo.Misc
    .findById(dbName)
    .exec()
    .catch(() => null) as any

  if (!config)
    return ReqError.badGateway(res)

  config.data = req.body

  config.save()
  res.status(200).json(config?.data || {})

  AuditLog.record({
    event: 'admin_config_update',
    author: res.locals.user?.id,
    name
  })
}
