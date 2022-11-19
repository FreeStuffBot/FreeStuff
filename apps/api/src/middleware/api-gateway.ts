// cors({ origin: process.env.NODE_ENV !== 'development' ? 'https://dashboard.freestuffbot.xyz' : 'http://localhost:5522' })


import { AppType } from '@freestuffbot/common'
import { Request, Response, NextFunction } from 'express'
import Mongo from '../database/mongo'
import Redis from '../database/redis'
import ReqError from '../lib/req-error'

//

export type ApiSubset
  = 'dash'
  | 'internal'
  | 'public'
  | 'v1'
  | 'v2'

//

export async function validateToken(auth: string, locals: Response['locals']) {
  const [ method, key, suid ] = auth.split(' ')
  if (method === 'Basic') {
    if (suid !== undefined) return false
  } else if (method === 'Partner') {
    if (suid === undefined) return false
    locals.suid = suid
  } else {
    return false
  }

  const app = await Mongo.App.findOne({ key }) as AppType

  if (!app) return false
  if (app.type !== method.toLowerCase()) return false

  locals.access = method.toLowerCase()
  locals.appid = app._id

  return true
}

export function apiGateway(subset: ApiSubset, partnerOnly = false): (req: Request, res: Response, next: NextFunction) => any {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (subset === 'dash')
      return next()

    if (subset === 'public')
      return next()

    //

    if (!req.headers.authorization)
      return ReqError.invalidAuth(res, 'Authorization header missing')

    const token = await validateToken(req.headers.authorization, res.locals)
    if (!token)
      return ReqError.invalidAuth(res, 'Authorization token invalid')
      
    if (partnerOnly && !req.headers.authorization.startsWith('Partner'))
      return ReqError.invalidAuth(res, 'This endpoint is privileged')  

    //

    Redis.set(`apiapp_${res.locals.appid}_last_used`, Date.now().toString())
    Redis.inc(`apiapp_${res.locals.appid}_total_requests`)

    res.header({ 'X-Server-Time': Date.now() })
    next()
  }
}
