import { PlatformDataType, PlatformSanitizer, PlatformType } from '@freestuffbot/common'
import { Request, Response } from 'express'
import Mongo from "../../../database/mongo"
import ReqError from '../../../lib/req-error'


export async function getPlatforms(_, res: Response) {
  const platforms = await Mongo.Platform
    .find({})
    .skip(res.locals.pageOffset)
    .limit(res.locals.pageAmount)
    .lean(true)
    .exec()
    .catch(() => ReqError.badGateway(res)) as any[]

  const sanitized = platforms.map(PlatformSanitizer.sanitize)

  res.status(200).json(sanitized || {})
}


export async function postPlatform(req: Request, res: Response) {
  const body = req.body
  if (!body || typeof body !== 'object')
    return ReqError.badRequest(res, 'Body invalid', 'Invalid body')

  if (!body.id || !/^\d{1,2}$/.test(body.id))
    return ReqError.badRequest(res, 'Body invalid', 'Id must be a number')

  const idTaken = await Mongo.Platform.exists({ _id: body.id })
  if (idTaken) return ReqError.badRequest(res, 'Id already taken', 'Another platform by this id already exists.')

  const data: PlatformDataType = {
    _id: body.id,
    code: '',
    name: '',
    url: '',
    description: '',
    enabledDefault: false,
    autoPublish: false,
    assets: {
      icon: '',
      discordEmoji: ''
    },
    gibuRef: ''
  }

  const platform: PlatformType = new Mongo.Platform(data)
  await platform.save()
  
  const out = PlatformSanitizer.sanitize(data)
  res.status(200).json(out)
}


export async function patchPlatform(req: Request, res: Response) {
  const id = req.params.platform
  if (!id)
    return ReqError.badRequest(res, 'Id invalid', 'Invalid id')

  const body = req.body
  if (!body || typeof body !== 'object')
    return ReqError.badRequest(res, 'Body invalid', 'Invalid body')
    
  const platform: PlatformType = await Mongo.Platform
    .findById(id)
    .exec()
    .catch(() => {})

  if (!platform)
    return ReqError.notFound(res, `No platform with id "${id}" found!`)

  for (const key in body) {
    if (key === 'id') continue
    platform[key] = body[key]
  }

  platform.save()
    .then(() => res.status(200).json({}))
    .catch(err => ReqError.badGateway(res, JSON.stringify(err)))
}


export async function deletePlatform(req: Request, res: Response) {
  const id = req.params.platform
  if (!id)
    return ReqError.badRequest(res, 'Id invalid', 'Invalid id')
    
  const platform: PlatformType = await Mongo.Platform
    .findById(id)
    .exec()
    .catch(() => {})

  if (!platform)
    return ReqError.notFound(res, `No platform with id "${id}" found!`)

  platform.delete()
    .then(() => res.status(200).json({}))
    .catch(err => ReqError.badGateway(res, JSON.stringify(err)))
}
