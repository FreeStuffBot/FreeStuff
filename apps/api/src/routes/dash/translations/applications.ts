import { DiscordUtils, SanitizedTranslateApplicationType, TranslateApplicationDataType, TranslateApplicationSanitizer, TranslateApplicationType, UserDataType, UserType } from '@freestuffbot/common'
import { Request, Response } from 'express'
import { config } from '../../..'
import Mongo from '../../../database/mongo'
import { DiscordBridge } from '../../../lib/discord-bridge'
import Notifier from '../../../lib/notifier'
import ReqError from '../../../lib/req-error'


export async function getTranslationsApplicationsStatus(_req: Request, res: Response) {
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

export async function postTranslationsApplication(req: Request, res: Response) {
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

  const languageCorrect = await Mongo.Language.exists({ _id: req.body.language })
  if (!languageCorrect) return ReqError.badRequest(res, 'invalid_language', 'Foolery.')

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

export async function getTranslationsApplications(req: Request, res: Response) {
  const countOnly = !!req.query.countOnly
  const declined = !!req.query.declined

  if (countOnly) {
    const out = await Mongo.TranslateApplication
      .count(declined ? {} : { declined: null })
      .exec()
      .catch(() => null)
    if (out as any === null) return ReqError.badGateway(res)
    return res.status(200).json({ count: out })
  }

  const apps = await Mongo.TranslateApplication
    .find(declined ? {} : { declined: null })
    .lean(true)
    .exec()
    .catch(() => 0) as TranslateApplicationDataType[]

  if (apps as any === 0) return ReqError.badGateway(res)
  const sanitized = apps.map(TranslateApplicationSanitizer.sanitize)
  const out = await Promise.all(sanitized.map(async (data: SanitizedTranslateApplicationType) => {
    const userData = await Mongo.User
      .findById(data.id)
      .lean(true)
      .exec()
      .catch(() => ({})) as UserDataType
    const user = {
      id: userData._id,
      name: userData.display || userData.data.username,
      icon: DiscordUtils.getAvatar(userData.data)
    }
    return { ...data, user }
  }))
  return res.status(200).json(out)
}

export async function patchTranslationsApplication(req: Request, res: Response) {
  if (req.body?.accept === undefined)
    return ReqError.badRequest(res, 'malformed_body', 'Malformed request body')

  const id = req.params.id ?? ''

  const application = await Mongo.TranslateApplication
    .findById(id)
    .exec()
    .catch(() => 0) as TranslateApplicationType

  if (application as any === 0) return ReqError.badGateway(res)
  if (!application) return ReqError.notFound(res)

  const accept = !!req.body.accept
  if (accept) {
    const user = await Mongo.User.findById(id) as UserType
    if (!user) return ReqError.internalServerError(res, 'User Not Found')
    user.scope.push(`translate.${application.language}`)
    await user.save()
    await application.delete()
    Notifier.sendPlain(id, {
      title: 'An update on your translate application',
      message: `Hey ${user.display}! Welcome to the FreeStuff translation team!\nWe are happy to welcome you in! With receiving this message you should have gotten access to two things:\n1. The translation panel, you can find it on the left. Same place where you submitted your application\n2. A Discord channel for all translators.\nMake yourself home and check out the translation page to get started!`
    })
    DiscordBridge.assignRole(id, config.discordCommunity.roles.donor)
  } else {
    application.declined = req.body.reason || 'No reason provided'
    application.save()
    Notifier.sendPlain(id, {
      title: 'An update on your translate application',
      message: `Hey there! Thank you for your interest, unfortunately your application was declined. Here's why: ${application.declined}`
    })
  }

  return res.status(200).end()
}
