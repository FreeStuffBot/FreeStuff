import { Request, Response, NextFunction } from "express"
import Mongo from "../database/mongo"
import JWT from "../lib/jwt"
import ReqError from "../lib/req-error"
import UserAuth, { UserAuthPayload } from "../lib/user-auth"


export default function dashGateway(scope: string): (req: Request, res: Response, next: NextFunction) => any {
  return async (req: Request, res: Response, next: NextFunction) => {
    // auth header?
    if (req.headers.authorization) {
      const authPayload = await JWT.decodeRaw(req.headers.authorization) as UserAuthPayload | undefined
      if (authPayload)
        res.locals.user = await Mongo.User.findById(authPayload.id)
      else
        res.locals.user = null
    }

    if (UserAuth.hasPermission(scope, res.locals.user, req))
      next()
    else
      ReqError.invalidAuth(res)
  }
}