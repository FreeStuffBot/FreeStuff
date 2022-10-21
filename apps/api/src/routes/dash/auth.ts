import { LanguageType, NotificationDataType, NotificationSanitizer, SanitizedNotificationType, UserType } from '@freestuffbot/common'
import { Request, Response } from 'express'
import Mongo from '../../database/mongo'
import OAuthStrat, { OauthDiscordUserObject } from '../../lib/oauth-strat'
import ReqError from '../../lib/req-error'
import UserAuth from '../../lib/user-auth'


export function getLogin(req: Request, res: Response) {
  const provider = req.params.provider
  if (!provider) return res.status(400).send({ error: 'missing_provider' })
  // keep this commented out. session might be outdated or token might be invalid
  // if (res.locals.user) return res.status(400).send({ error: 'already_authenticated' })

  const url = provider === 'discord'
    ? OAuthStrat.DISCORD_URL
    : null

  res.status(200).send({ url })
}

export async function postCode(req: Request, res: Response) {
  const provider = req.params.provider
  if (!provider)
    return res.status(400).send({ error: 'missing_provider' })

  const code = req.body?.code
  if (!code)
    return res.status(400).send({ error: 'missing_code' })

  let authUser: OauthDiscordUserObject | { error: string } = null
  switch (provider) {
    case 'discord':
      authUser = await OAuthStrat.discordCallback(code)
      break
  }

  if (!authUser)
    return res.status(400).send({ error: 'invalid_provider' })

  if ('error' in authUser)
    return res.status(400).send({ error: authUser.error })

  // eslint-disable-next-line camelcase
  const [ token, user, do_setup ] = await UserAuth.loginOrRegisterUser(req, authUser)

  res.status(200).send({
    token,
    user,
    do_setup
  })
}

export async function getMe(_req: Request, res: Response) {
  if (!res.locals.user)
    return ReqError.invalidAuth(res)

  const out = { ...res.locals.user.toObject() } as any

  delete out.logins
  delete out.data?._accessToken
  const [ lang, notif ] = await Promise.all([
    packageLang(),
    fetchNotifications(res.locals.user.id)
  ])
  out.lang = lang
  out.notifications = notif

  // package guilds if needed

  res.status(200).json(out)
}

/*
 *
 */

async function fetchNotifications(userId: string): Promise<SanitizedNotificationType[]> {
  const data = await Mongo.Notification
    .find({
      recipient: userId,
      readAt: { // filter out notifications read over a week ago
        $not: { $lt: Date.now() - 7 * 24 * 60 * 60 * 1000 }
      }
    })
    .lean(true)
    .limit(99)
    .exec()
    .catch(() => ([])) as NotificationDataType[]

  return data.map(NotificationSanitizer.sanitize)
}

/*
 *
 */

const LANG_CACHE_MAX_AGE = 1000 * 60 * 5
let langCacheData = {}
let langCacheAge = 0

async function packageLang() {
  if (Date.now() - langCacheAge < LANG_CACHE_MAX_AGE) return langCacheData

  const out = {} as {[key: string]: string}

  const raw: [
    UserType[],
    LanguageType[]
  ] = await Promise.all([
    Mongo.User
      .find({ scope: { $exists: true, $ne: [] } })
      .exec(),
    Mongo.Language
      .find({})
      .select({ _index: 1, lang_name_en: 1 })
      .exec()
  ])

  raw[0]?.forEach(u => (out[u._id] = u.display))
  raw[1]?.forEach(l => (out['lang_' + l._index] = l.lang_name_en))
  raw[1]?.forEach(l => (out['lang_' + l._id] = l.lang_name_en))

  langCacheAge = Date.now()
  langCacheData = out

  return out
}

// export async function fetchGuildData(accessToken: string, rich: boolean = true): Promise<any | null> {
//   try {
//     const { data } = await axios.get('https://discord.com/api/v7/users/@me/guilds', {
//       headers: { Authorization: `Bearer ${accessToken}` }
//     })
//     if (rich) {
//       for (const guild of data) {
//         if ((guild.permissions & 1 << 5) === 0 && (guild.permissions & 1 << 3) === 0) continue
//         const freestuff = await Database
//           .collection('guilds')
//           ?.findOne({ _id: Long.fromString(guild.id) })
//         guild.freestuff = freestuff
//       }
//     }
//     return data
//   } catch (ex) {
//     return null
//   }
// }
