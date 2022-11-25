import { LanguageDataType } from '@freestuffbot/common'
import { Request, Response } from 'express'
import Mongo from '../../database/mongo'
import ReqError from '../../lib/req-error'


function validateToken(token: string): Promise<boolean> {
  if (!token || typeof token !== 'string' || token.length > 128)
    return Promise.resolve(false)

  return Mongo.Misc
    .exists({
      _id: 'config.global',
      'data.global.ciTokens': token
    })
}

export async function getBuildWeb(req: Request, res: Response) {
  const valid = await validateToken(req.headers.authorization)
  if (!valid) return ReqError.invalidAuth(res)

  const english = await Mongo.Language
    .findOne({ _index: 0 })
    .lean(true)
    .exec()
    .catch(() => 0) as LanguageDataType | 0
  if (english === 0) return ReqError.badGateway(res)

  const keys = Object.keys(english)
    .filter(k => k.startsWith('_') || k.startsWith('web_'))
  const selector = {}
  for (const key of keys)
    selector[key] = 1

  const all = await Mongo.Language
    .find({ _enabled: true })
    .select(selector)
    .lean(true)
    .exec()
    .catch(() => 0) as LanguageDataType | 0
  if (all === 0) return ReqError.badGateway(res)
  
  res.status(200).json({
    i18n: all
  })
}
