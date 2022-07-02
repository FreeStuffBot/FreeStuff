import { CurrencyDataType, CurrencySanitizer, ExperimentDataType, ExperimentSanitizer, LanguageDataType, MiscDataType, PlatformDataType, PlatformSanitizer } from '@freestuffbot/common'
import { Request, Response } from 'express'
import Mongo from '../../database/mongo'
import ReqError from '../../lib/req-error'


export async function getLanguages(_req: Request, res: Response) {
  const lang: LanguageDataType[] = await Mongo.Language
    .find({
      _index: { $gte: 0 },
      _enabled: true
    })
    .lean(true)
    .exec()
    .catch(() => null) as any[]

  if (!lang)
    return ReqError.badGateway(res)

  res.status(200).json(lang)
}


export async function getCmsConstants(_req: Request, res: Response) {
  const currencies: CurrencyDataType[] = await Mongo.Currency
    .find({})
    .lean(true)
    .exec()
    .catch(() => null) as any[]

  if (!currencies)
    return ReqError.badGateway(res)

  const platforms: PlatformDataType[] = await Mongo.Platform
    .find({})
    .lean(true)
    .exec()
    .catch(() => null) as any[]

  if (!platforms)
    return ReqError.badGateway(res)

  const out = {
    currencies: currencies.map(CurrencySanitizer.sanitize),
    platforms: platforms.map(PlatformSanitizer.sanitize)
  }
  res.status(200).json(out)
}


export async function getRemoteConfig(_req: Request, res: Response) {
  const config: MiscDataType = await Mongo.Misc
    .findById('config.global')
    .lean(true)
    .exec()
    .catch(() => null) as any

  if (!config)
    return ReqError.badGateway(res)

  res.status(200).json(config.data)
}


export async function getExperiments(_req: Request, res: Response) {
  const experiments: ExperimentDataType[] = await Mongo.Experiment
    .find({})
    .lean(true)
    .exec()
    .catch(() => null) as any

  if (!experiments)
    return ReqError.badGateway(res)

  const out = experiments.map(ExperimentSanitizer.sanitize)
  res.status(200).json(out)
}
