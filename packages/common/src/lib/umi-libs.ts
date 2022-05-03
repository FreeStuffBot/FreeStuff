import { Request, Response, NextFunction } from 'express'
import * as ip from 'ip'


export default class UmiLibs {

  public static ipLockMiddleware(range: string) {
    const subnet = range ? ip.cidrSubnet(range) : null
    return (req: Request, res: Response, next: NextFunction) => {
      if (!range || subnet.contains(req.ip)) return next()

      res.status(407).send(`Not allowed. Your IP address does not have access to this resource.\n${req.ip}`)
    }
  }

}
