import { Request, Response } from 'express'
import Mongo from '../../../database/mongo'
import DiscordUtils from '../../../lib/discord-utils'
import ReqError from '../../../lib/req-error'


export async function getLanguages(req: Request, res: Response) {
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


export async function getLanguage(req: Request, res: Response) {
  Mongo.Language
    .findById(req.params.name)
    .lean(true)
    .exec()
    .then(data => res.status(200).json(data || {}))
    .catch(() => ReqError.badGateway(res))
}


/*
 *
 */

function getResponsibleForLanguage(languageId: string, users: any[]) {
  return users
    .filter(u => u.scope?.includes(`translate.${languageId}`))
    .map(u => ({
      name: u.data.username || u.display,
      icon: DiscordUtils.getAvatar(u.data)
    }))
}
