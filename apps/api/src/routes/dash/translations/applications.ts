import { TranslateApplicationDataType, TranslateApplicationType } from '@freestuffbot/common'
import { Request, Response } from 'express'
import Mongo from '../../../database/mongo'
import ReqError from '../../../lib/req-error'


export async function getTranslationsApplicationStatus(_req: Request, res: Response) {
  if (!res.locals.user) return ReqError.badRequest(res, 'no_user', 'error')
  const id = res.locals.user._id

  const out = await Mongo.TranslateApplication
    .findById(id)
    .lean(true)
    .exec()
    .catch(() => 0) as TranslateApplicationDataType

  if (out as any === 0) return ReqError.badGateway(res)
  if (!out)
    return ReqError.notFound(res)

  if (out.declined)
    return ReqError.noAccess(res, out.declined + '')

  return res.status(200).end()
}

export async function postTranslationsApply(req: Request, res: Response) {
  console.log(res.locals.user)
  if (!res.locals.user) return ReqError.badRequest(res, 'no_user', 'error')
  const id = res.locals.user._id

  if (!req.body?.language || !req.body.userSince || !req.body.whyThem || !req.body.whereFrom)
    return ReqError.badRequest(res, 'malformed_body', 'Malformed Request Body')

  const out = await Mongo.TranslateApplication
    .findById(id)
    .lean(true)
    .exec()
    .catch(() => 0) as TranslateApplicationDataType

  if (out as any === 0) return ReqError.badGateway(res)
  if (out) return ReqError.badRequest(res, 'already_submitted', 'You already submitted an application!')

  const app = new Mongo.TranslateApplication({
    _id: id,
    submitted: Date.now(),
    language: req.body.language,
    userSince: req.body.userSince,
    whyThem: req.body.whyThem,
    whereFrom: req.body.whereFrom,
    declined: null
  }) as TranslateApplicationType
  await app.save()

  res.status(200).json({})
}
