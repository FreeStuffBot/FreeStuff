import { Request, Response, NextFunction } from 'express'
import * as ip from 'ip'


export default class UmiLibs {

  public static ipLockMiddleware(range: string) {
    const subnet = ip.cidrSubnet(range)
    return (req: Request, res: Response, next: NextFunction) => {
      if (subnet.contains(req.ip)) return next()

      res.status(401).send('Not allowed. Your IP address does not have access to this resource.')
    }
  }

}
