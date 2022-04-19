import { MiscDataType } from '@freestuffbot/common'
import { Request, Response } from 'express'
import Mongo from '../../../database/mongo'
import ReqError from '../../../lib/reqerror'


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
