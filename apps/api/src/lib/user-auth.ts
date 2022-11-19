/**
 * @author Andreas May <andreas@maanex.me>
 * @copyright 2020 File Authors
 */

import { UserDataType, UserType } from '@freestuffbot/common'
import { Request } from 'express'
import Mongo from '../database/mongo'
import IPApi from './ipapi'
import JWT from './jwt'
import { OauthDiscordUserObject } from './oauth-strat'


export type UserAuthPayload = {
  id: string
}

export default class UserAuth {

  public static async parseUser(header: string): Promise<UserAuthPayload | null> {
    const payload: any = await JWT.decodeRaw(header, false)
    if (!payload) return null

    return {
      id: payload.id
    }
  }

  public static async loginOrRegisterUser(req: Request, user: OauthDiscordUserObject): Promise<[string, any, boolean]> {
    const found: UserType | undefined = await Mongo.User.findById(user.id)

    if (found) {
      found.data = UserAuth.compileDuserData(user)
      await UserAuth.registerNewLogin(req, found)
      await found.save()

      return [ await JWT.signAuth({ id: found._id }), found, false ]
    }

    const duser: UserType = new Mongo.User({
      _id: user.id,
      display: user.username,
      data: UserAuth.compileDuserData(user),
      scope: [],
      logins: []
    })

    await duser.save()
    return [ await JWT.signAuth({ id: user.id }), duser, true ]
  }

  private static reportTimeout: Set<string> = new Set()

  public static async registerNewLogin(req: Request, user: UserType) {
    if (!user.scope?.length) return
    if (this.reportTimeout.has(user.data.id)) return
    this.reportTimeout.add(user.data.id)
    setTimeout((id: string) => this.reportTimeout.delete(id), 1000 * 60 * 60 * 6, user.data.id)

    const trueIp = (req.headers['cf-connecting-ip'] as string) || req.ip
    const geoloc = await IPApi.lookup(trueIp)

    user.logins.push({
      t: Date.now(),
      i: trueIp,
      la: geoloc?.latitude ?? 0,
      lo: geoloc?.longitude ?? 0
    })
  }

  private static compileDuserData(user: OauthDiscordUserObject): UserDataType['data'] {
    const out = {...user}
    delete out._accessToken
    return out
  }

  public static hasPermission(scope: string, user: UserType, req?: Request): boolean {
    // not locked -> pass
    if (scope === '[everyone]')
      return true

    // can't pass without login -> stop
    if (!user)
      return false

    // need to be logged in -> pass
    if (scope === '[logged_in]')
      return true

    // find scopes
    const scopes = scope
      .split('|')
      .map((s) => {
        if (req) {
          for (const param in req.params)
            s = s.split(`{${param}}`).join(req.params[param])
        }
        return s
      })
      .map(s => s.trim())
      .map(s => s.split('.').join('\\.'))
      .map(s => s.split('*').join('.*'))
      .map(s => `^${s}$`)

    // check scopes
    for (const item of scopes) {
      for (const permission of user.scope) {
        if (new RegExp(item, 'g').test(permission))
          return true
      }
    }

    // cringe -> stop
    return false
  }

}
