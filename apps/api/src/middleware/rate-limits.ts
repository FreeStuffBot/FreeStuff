import { Request, Response } from 'express'
import rateLimit from 'express-rate-limit'
import ReqError from '../lib/req-error'


export function rateLimiter(max: number, window: number, bucket: string = '') {
  return rateLimit({
    windowMs: window * 1000,
    max,
    headers: true,
    keyGenerator(req: Request) {
      let localBucket = bucket
      if (localBucket.includes('{')) {
        for (const key in req.params)
          localBucket = bucket.split(`{${key}}`).join(req.params[key])
      }

      return (req.headers.authorization || req.ip) + localBucket
    },
    handler(_, res: Response) {
      ReqError.rateLimited(res)
    }
  })
}