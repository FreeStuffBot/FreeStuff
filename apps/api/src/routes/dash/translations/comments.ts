import { LanguageDataType, Logger, SanitizedTranslationType, TranslationDataType, TranslationEntryType, TranslationSanitizer, TranslationType } from '@freestuffbot/common'
import { Request, Response } from 'express'
import Mongo from '../../../database/mongo'
import AuditLog from '../../../lib/audit-log'
import ReqError from '../../../lib/req-error'
import TranslationUtils from '../../../lib/translation-utils'
import UserAuth from '../../../lib/user-auth'

const queryUpvotedBy = { $size: { $ifNull: [ '$upvotedBy', []] } } as const
const queryDownvotedBy = { $size: { $ifNull: [ '$downvotedBy', []] } } as const
const queryComputeVoteScore = { $set: { voteScore: { $subtract: [ queryUpvotedBy, queryDownvotedBy ] } } } as const
const querySortByVoteScore = { $sort: { approved: -1, voteScore: -1 } } as const

export async function getComments(req: Request, res: Response) {
  const lang = req.params.language
  const line = req.params.line
  if (line.length > 128) return ReqError.badRequest(res, 'line_too_long', 'just no')
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

  const sanitized = data.map(TranslationSanitizer.sanitize)
  const existsApproved = sanitized.some(el => el.approved)

  const out = await Promise.all(sanitized
    .map(async (data: SanitizedTranslationType | any, i: number) => {
      const [ name, icon ] = await AuditLog.getAuthor(data.id.split(':')[2])
      data.user = { name, icon }
      const voteScore = data.upvotedBy.length - data.downvotedBy.length

      data.active = existsApproved
        ? data.approved
        : (i === 0 && voteScore >= TranslationUtils.getMinUpvotes(lang))

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
  const approve = req.body?.approve
  const userId = res.locals.user.id

  if (!userId)
    return ReqError.internalServerError(res, 'no user?')

  // this regex is required to avoid injection attacks where people could use a forged commentId, example:
  // a|[logged_in]:line:user -> would check for scope 'translate.a|[logged_in]' which would always yield true
  if (!/^(?:\w{2}-)?\w{2}$/g.test(lang))
    return ReqError.badRequest(res, 'invalid_id', 'don\'t mess with that')

  if (vote !== undefined) {
    if (typeof vote !== 'number')
      return ReqError.badRequest(res, 'invalid_body', 'HUH!?')
    if (!UserAuth.hasPermission(`admin|translate.${lang}`, res.locals.user))
      return ReqError.noAccess(res, 'not your language, get your fingers off!')

    const comment = await Mongo.Translation
      .findById(commentId)
      .exec()
      .catch(() => 0) as TranslationType

    if (comment as any === 0) return ReqError.badGateway(res)
    if (!comment) return ReqError.notFound(res)

    const save = helperCastCommentVote(userId, vote, comment, res)

    if (save) {
      comment.save()
        .catch(() => ReqError.badGateway(res))
        .then(() => void res.status(200).end())
        .then(() => helperPromoteCorrectSuggestion(comment.parent))
    }
    return
  }
  
  if (approve !== undefined) {
    if (typeof approve !== 'boolean')
      return ReqError.badRequest(res, 'invalid_body', 'HUH!?')
    if (!UserAuth.hasPermission(`admin|contentmod|langmain.${lang}`, res.locals.user))
      return ReqError.noAccess(res, 'you are not a maintainer, back off!')

    const comment = await Mongo.Translation
      .findById(commentId)
      .exec()
      .catch(() => 0) as TranslationType

    if (comment as any === 0) return ReqError.badGateway(res)
    if (!comment) return ReqError.notFound(res)

    const save = helperCastCommentApproval(approve, comment, res)

    if (save) {
      comment.save()
        .catch(() => ReqError.badGateway(res))
        .then(() => void res.status(200).end())
        .then(() => helperPromoteCorrectSuggestion(comment.parent))
    }
    return
  }

  ReqError.badRequest(res, 'invalid_body', 'No data provided')
}

function helperCastCommentVote(userId: string, vote: number, comment: TranslationType, res: Response): boolean {
  if (vote > 0) {
    if (comment.upvotedBy.includes(userId))
      return void res.status(200).end()
    if (comment.downvotedBy.includes(userId))
      comment.downvotedBy.splice(comment.downvotedBy.indexOf(userId), 1)
    comment.upvotedBy.push(userId)
    return true
  }
  
  if (vote < 0) {
    if (comment.downvotedBy.includes(userId))
      return void res.status(200).end()
    if (comment.upvotedBy.includes(userId))
      comment.upvotedBy.splice(comment.upvotedBy.indexOf(userId), 1)
    comment.downvotedBy.push(userId)
    return true
  }

  if (comment.downvotedBy.includes(userId))
    comment.downvotedBy.splice(comment.downvotedBy.indexOf(userId), 1)
  else if (comment.upvotedBy.includes(userId))
    comment.upvotedBy.splice(comment.upvotedBy.indexOf(userId), 1)
  else
    return void res.status(200).end()

  return true
}

function helperCastCommentApproval(approve: boolean, comment: TranslationType, res: Response): boolean {
  if (approve) {
    if (comment.approved)
      return void res.status(200).end()

    // un-approve other(s)
    Mongo.Translation
      .updateMany({
        parent: comment.parent,
        _id: { $ne: comment.id },
        approved: true
      }, {
        approved: false
      })
      .lean(true)
      .exec()
      .catch(Logger.warn)

    comment.approved = true
    AuditLog.record({
      event: 'translations_approve_suggestion',
      author: res.locals.user?.id,
      override: true,
      commentId: comment.id
    })

    return true
  }

  if (!comment.approved)
    return void res.status(200).end()

  comment.approved = false
  AuditLog.record({
    event: 'translations_approve_suggestion',
    author: res.locals.user?.id,
    override: false,
    commentId: comment.id
  })

  return true
}

async function helperGetTopComment(parent: string): Promise<TranslationDataType> {
  const [ lang ] = parent.split(':')
  const minUpvotes = TranslationUtils.getMinUpvotes(lang)

  const raw = await Mongo.Translation
    .aggregate([
      queryComputeVoteScore,
      { $match: { $or: [
        { parent, approved: true },
        { parent, voteScore: { $gte: minUpvotes } }
      ] } },
      querySortByVoteScore,
      { $limit: 1 }
    ])
    .exec()
    .catch(() => null)

  if (!raw?.length) return null
  return raw[0]
}

async function helperPromoteCorrectSuggestion(parent: string) {
  const [ lang, key ] = parent.split(':')
  if (key.startsWith('_')) return // should not be possible but just to be sure

  const top = await helperGetTopComment(parent)
  if (!top) return

  const line = await Mongo.Language
    .findById(lang)
    .select({ [key]: 1 })
    .lean(true)
    .exec()
    .catch(() => null) as LanguageDataType

  if (!line) return
  if (line[key] === top.text) return

  await Mongo.Language
    .updateOne(
      { _id: lang },
      { $set: { [key]: top.text } },
      { returnNewDocument: false, strict: false }
    )
    .exec()
    .catch(Logger.warn)
}

export async function postComment(req: Request, res: Response) {
  const lang = req.params.language
  const line = req.params.line
  const userId = res.locals.user?.id
  let text = req.body.text
  
  // check if input is valid
  if (!text) return ReqError.badRequest(res, 'no_text', 'No text? (megamind pleading meme)')
  if (line.length > 128) return ReqError.badRequest(res, 'line_too_long', 'just no')
  if (!userId) return ReqError.badRequest(res, 'no_user', 'how?')
  if (!/^(?:\w{2}-)?\w{2}$/g.test(lang)) return ReqError.badRequest(res, 'invalid_id', 'don\'t mess with that')
  if (typeof text !== 'string') return ReqError.badRequest(res, 'invalid_text', 'wrong.')

  // check if the line actually exists
  const langLineExists = await Mongo.Language
    .exists({ _id: lang, [line]: { $exists: 1 } })
  if (!langLineExists) return ReqError.badRequest(res, 'invalid_target', 'Invalid target')

  const parent = `${lang}:${line}`
  const id = `${lang}:${line}:${userId}`

  // check if text is already there
  text = text.trim()
  const sameTextExisting = await Mongo.Translation
    .findOne({ parent, text })
    .exec()
    .catch(() => 0) as TranslationType | 0
  if (sameTextExisting === 0) return ReqError.badGateway(res)

  if (sameTextExisting) {
    if (!sameTextExisting.upvotedBy.includes(userId)) {
      sameTextExisting.upvotedBy.push(userId)
      sameTextExisting.save()
    }
    return res.status(200).end()
  }

  // check if there's already a suggestion by the user
  const sameUserExisting = await Mongo.Translation
    .findById(id)
    .exec()
    .catch(() => 0) as TranslationType | 0
  if (sameUserExisting === 0) return ReqError.badGateway(res)

  if (!sameUserExisting) {
    const created = new Mongo.Translation({
      _id: id,
      parent,
      type: TranslationEntryType.SUGGESTION,
      text,
      createdAt: Date.now(),
      upvotedBy: [ userId ],
      downvotedBy: [],
      approved: false
    } satisfies TranslationDataType) as TranslationType

    created.save()
      .then(() => res.status(200).end())
      .catch(() => ReqError.badGateway(res))

    AuditLog.record({
      event: 'translations_post_comment',
      author: res.locals.user?.id,
      override: false,
      commentId: id
    })
    return
  }

  const top = await helperGetTopComment(parent)

  // check if current top comment is by the person updating it
  if (top?._id === id) {
    const dummyPostId = `${parent}:1`

    // delete previous dummy post, if exists
    await Mongo.Translation.deleteOne({ _id: dummyPostId })

    // create new dummy post that copies over all data from the to-replace post
    const created = new Mongo.Translation({ ...top, _id: dummyPostId }) as TranslationType
    created.save().catch(Logger.warn)
  }

  sameUserExisting.approved = false
  sameUserExisting.createdAt = Date.now()
  if (sameUserExisting.upvotedBy) {
    sameUserExisting.upvotedBy = []
    sameUserExisting.downvotedBy = []
    // we are only cleaing downvotes if the post got at least one upvote
    // this is to combat spamers who briefly change their suggestion in order to get rid of downvotes
  }

  sameUserExisting.text = text
  sameUserExisting.save()
    .then(() => res.status(200).end())
    .catch(() => ReqError.badGateway(res))

  AuditLog.record({
    event: 'translations_post_comment',
    author: res.locals.user?.id,
    override: true,
    commentId: id
  })
}