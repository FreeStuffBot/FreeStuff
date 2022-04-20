import { CurrencyDataType, LanguageDataType, PlatformDataType } from '@freestuffbot/common'
import { Request, Response } from 'express'
import Mongo from '../../database/mongo'


export async function getLanguages(req: Request, res: Response) {
  const lang: LanguageDataType[] = await Mongo.Language
    .find({
      _index: { $gte: 0 },
      _enabled: true
    })
    .lean(true)
    .exec()
    .catch(() => {}) as any[]

  res.status(200).json(lang)
}


export async function getCmsConstants(req: Request, res: Response) {
  const currencies: CurrencyDataType[] = await Mongo.Currency
    .find({})
    .lean(true)
    .exec()
    .catch(() => {}) as any[]

  const platforms: PlatformDataType[] = await Mongo.Platform
    .find({})
    .lean(true)
    .exec()
    .catch(() => {}) as any[]

  res.status(200).json({ currencies, platforms })
}


export async function getRemoteConfig(req: Request, res: Response) {
  res.status(200).json({ soon: 'tm' })
}
