import { SanitizedTranslationType, TranslationDataType, TranslationSanitizer, TranslationType } from '@freestuffbot/common'
import { Request, Response } from 'express'
import Mongo from '../../../database/mongo'
import AuditLog from '../../../lib/audit-log'
import DiscordUtils from '../../../lib/discord-utils'
import ReqError from '../../../lib/req-error'
import TranslationUtils from '../../../lib/translation-utils'
import UserAuth from '../../../lib/user-auth'


export async function getLanguagesPreview(_req: Request, res: Response) {
  const out = await Mongo.Language
    .find({ _index: { $gte: 0 } })
    .lean(true)
    .sort({ lang_name_en: 1 })
    .select({
      _id: 1,
      _index: 1,
      _enabled: 1,
      _meta_progress: 1,
      lang_name: 1,
      lang_name_en: 1,
      lang_flag_emoji: 1,
      _ranking: 1
    })
    .exec()
    .catch(() => ReqError.badGateway(res)) as any[]

  res.status(200).json(out || {})
}

export async function getLanguages(_req: Request, res: Response) {
  const users = await Mongo.User
    .find({})
    .lean(true)
    .select({
      _id: 1,
      display: 1,
      scope: 1,
      'data.id': 1,
      'data.username': 1,
      'data.avatar': 1,
      'data.discriminator': 1
    })
    .exec()
    .catch(() => ReqError.badGateway(res)) as any[]

  const languages = await Mongo.Language
    .find({})
    .lean(true)
    .select({
      _id: 1,
      _index: 1,
      _enabled: 1,
      _meta_progress: 1,
      _meta_last_edit: 1,
      _meta_last_editor: 1,
      lang_name_en: 1,
      _ranking: 1
    })
    .exec()
    .catch(() => ReqError.badGateway(res)) as any[]

  const out = languages.map(lang => ({
    ...lang,
    _meta_responsible: getResponsibleForLanguage(lang._id, users)
  }))

  res.status(200).json(out || {})
}


export function getLanguage(req: Request, res: Response) {
  const name = parseLanguageName(req.params.language)

  return Mongo.Language
    .findById(name)
    .lean(true)
    .exec()
    .then(data => res.status(200).json(data || {}))
    .catch(() => ReqError.badGateway(res))
}


const queryUpvotedBy = { $size: { $ifNull: [ '$upvotedBy', []] } } as const
const queryDownvotedBy = { $size: { $ifNull: [ '$downvotedBy', []] } } as const
const queryComputeVoteScore = { $set: { voteScore: { $subtract: [ queryUpvotedBy, queryDownvotedBy ] } } } as const
const querySortByVoteScore = { $sort: { voteScore: -1 } } as const

export async function getComments(req: Request, res: Response) {
  const lang = parseLanguageName(req.params.language)
  const line = req.params.line
  if (line.length > 50) return ReqError.badRequest(res, 'line_too_long', 'just no')
  const userId = res.locals.user?.id
  if (!userId) return ReqError.badRequest(res, 'no_user', 'how?')

  const queryMatchLine = { $match: { parent: `${lang}:${line}` } }
  const query = [
    queryMatchLine,
    queryComputeVoteScore,
    querySortByVoteScore
  ]
  const data = await Mongo.Translation
    .aggregate(query)
    .exec()
    .catch(() => 0) as TranslationDataType[]

  if (data as any === 0)
    return ReqError.badGateway(res)
  if (!data)
    return res.status(200).json([])

  const out = await Promise.all(data
    .map(TranslationSanitizer.sanitize)
    .map(async (data: SanitizedTranslationType | any, i: number) => {
      const [ name, icon ] = await AuditLog.getAuthor(data.id.split(':')[2])
      data.user = { name, icon }
      const voteScore = data.upvotedBy.length - data.downvotedBy.length
      data.active = data.approved || (i === 0 && voteScore >= TranslationUtils.getMinUpvotes(lang))

      if (UserAuth.hasPermission('admin|contentmod', res.locals.user)) {
        data.upvotes = data.upvotedBy.length
        data.downvotes = data.downvotedBy.length
      }

      data.selfUpvoted = data.upvotedBy.includes(userId)
      data.selfDownvoted = data.downvotedBy.includes(userId)
      delete data.upvotedBy
      delete data.downvotedBy

      return data
    })
  )

  res.status(200).json(out)
}

export async function patchCommentVote(req: Request, res: Response) {
  const commentId = req.params.id
  const lang = commentId.split(':')[0]
  const vote = req.body?.vote
  const userId = res.locals.user.id

  if (!userId)
    return ReqError.internalServerError(res, 'no user?')

  if (typeof vote !== 'number')
    return ReqError.badRequest(res, 'invalid_body', 'HUH!?')

  // this regex is required to avoid injection attacks where people could use a forged commentId, example:
  // a|[logged_in]:line:user -> would check for scope 'translate.a|[logged_in]' which would always yield true
  if (!/^(?:\w{2}-)?\w{2}$/g.test(lang))
    return ReqError.badRequest(res, 'invalid_id', 'don\'t mess with that')

  if (!UserAuth.hasPermission(`translate.${lang}`, res.locals.user))
    return ReqError.noAccess(res, 'not your language, get your fingers off!')

  const comment = await Mongo.Translation
    .findById(commentId)
    .exec()
    .catch(() => 0) as TranslationType

  if (comment as any === 0)
    return ReqError.badGateway(res)

  if (!comment)
    return ReqError.notFound(res)

  if (vote > 0) {
    if (comment.upvotedBy.includes(userId))
      return res.status(200).end()
    if (comment.downvotedBy.includes(userId))
      comment.downvotedBy.splice(comment.downvotedBy.indexOf(userId), 1)
    comment.upvotedBy.push(userId)
  } else if (vote < 0) {
    if (comment.downvotedBy.includes(userId))
      return res.status(200).end()
    if (comment.upvotedBy.includes(userId))
      comment.upvotedBy.splice(comment.upvotedBy.indexOf(userId), 1)
    comment.downvotedBy.push(userId)
  } else {
    // eslint-disable-next-line no-lonely-if
    if (comment.downvotedBy.includes(userId))
      comment.downvotedBy.splice(comment.downvotedBy.indexOf(userId), 1)
    else if (comment.upvotedBy.includes(userId))
      comment.upvotedBy.splice(comment.upvotedBy.indexOf(userId), 1)
    else
      return res.status(200).end()
  }

  comment.save()
    .catch(() => ReqError.badGateway(res))
    .then(() => res.status(200).end())
}


/*
 *
 */

function parseLanguageName(language: string) {
  return (language === '@origin')
      ? 'en-US'
      : (language === '@descriptions')
        ? 'descriptions'
        : language
}

function getResponsibleForLanguage(languageId: string, users: any[]) {
  return users
    .filter(u => u.scope?.includes(`translate.${languageId}`))
    .map(u => ({
      name: u.data?.username || u.display,
      icon: DiscordUtils.getAvatar(u.data)
    }))
}
