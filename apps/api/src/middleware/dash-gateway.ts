import { Request, Response, NextFunction } from "express"
import Mongo from "../database/mongo"
import JWT from "../lib/jwt"
import ReqError from "../lib/req-error"
import { UserAuthPayload } from "../lib/user-auth"


export default function dashGateway(scope: string): (req: Request, res: Response, next: NextFunction) => any {
  return async (req: Request, res: Response, next: NextFunction) => {
    let loggedIn = false

    // auth header?
    if (req.headers.authorization) {
      const authPayload = await JWT.decodeRaw(req.headers.authorization) as UserAuthPayload | undefined
      if (authPayload) {
        loggedIn = true
        res.locals.user = await Mongo.User.findById(authPayload.id)
      }
    }

    // not locked -> pass
    if (scope === '[everyone]')
      return next()

    // can't pass without login -> stop
    if (!loggedIn)
      return ReqError.invalidAuth(res)

    // need to be logged in -> pass
    if (scope === '[logged_in]')
      return next()

    // find scopes
    const scopes = scope
      .split('|')
      .map((s) => {
        for (const param in req.params)
          s = s.split(`{${param}}`).join(req.params[param])
        return s
      })
      .map(s => s.trim())
      .map(s => s.split('.').join('\\.'))
      .map(s => s.split('*').join('.*'))
      .map(s => `^${s}$`)
    
    if (!res.locals.user)
      return ReqError.invalidAuth(res)

    // check scopes
    for (const item of scopes) {
      for (const permission of res.locals.user.scope) {
        if (new RegExp(item, 'g').test(permission))
          return next()
      }
    }

    // cringe -> stop
    return ReqError.invalidAuth(res)
  }
}