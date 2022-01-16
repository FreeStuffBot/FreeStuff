// cors({ origin: process.env.NODE_ENV !== 'development' ? 'https://dashboard.freestuffbot.xyz' : 'http://localhost:5522' })


import { Request, Response, NextFunction } from 'express'
import * as rateLimit from 'express-rate-limit'
import Database from '../../database/database'
import Redis from '../database/redis'
import ReqError from '../lib/reqerror'


export type ApiSubset
  = 'dash'
  | 'internal'
  | 'v1'
  | 'v2'


export const validateToken = async (auth: string, locals: any) => {
  const [ method, key, suid ] = auth.split(' ')
  if (method === 'Basic') {
    if (suid !== undefined) return false
  } else if (method === 'Partner') {
    if (suid === undefined) return false
    locals.suid = suid
  } else {
    return false
  }

  const app = await Database
    .collection('api')
    ?.findOne({ key })

  if (!app) return false
  if (app.type !== method.toLowerCase()) return false

  locals.access = method.toLowerCase()
  locals.appid = app._id
  locals.appowner = app.owner

  return true
}

export function apiGateway(subset: ApiSubset): (req: Request, res: Response, next: NextFunction) => any {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization)
      return ReqError.invalidAuth(res, 'Authorization header missing')

    const token = await validateToken(req.headers.authorization, res.locals)
    if (!token)
      return ReqError.invalidAuth(res, 'Authorization token invalid')
  
    Redis.set(`apiapp_${res.locals.appid}_last_used`, Date.now().toString())
    Redis.inc(`apiapp_${res.locals.appid}_total_requests`)
  
    res.header({ 'X-Server-Time': Date.now() })
    next()
  }
}

export const rateLimiter = (max: number, window: number) => rateLimit({
  windowMs: window * 1000 * 60,
  max,
  headers: true,
  keyGenerator(req: Request) {
    return req.headers.authorization || req.ip
  },
  handler(_, res: Response) {
    ReqError.rateLimited(res)
  }
})
