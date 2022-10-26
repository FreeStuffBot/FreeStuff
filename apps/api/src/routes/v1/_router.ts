import { Response, Router } from 'express'
import { apiGateway } from '../../middleware/api-gateway'
import ReqError from '../../lib/req-error'
import { rateLimiter } from '../../middleware/rate-limits'
import { ping as Ping } from './ping'
import { router as GamesEndpoint } from './games'
import { router as GameEndpoint } from './game'


const disableRateLimits = process.env.NODE_ENV !== 'production'

export default class V1Router {

  private static ctx: Router

  public static init(): Router {
    this.ctx = Router()
    this.addRoutes()

    return this.ctx
  }

  private static addRoutes() {
    const r = this.ctx

    /* GATEWAY */

    r.all('*', apiGateway('v1'))


    /* ENDPOINTS */
    
    r.all('/ping', Ping)
    r.use('/game', rateLimiter(disableRateLimits ? 99999 : 20, 5*60), GameEndpoint)
    r.use('/games', rateLimiter(disableRateLimits ? 99999 : 10, 15*60), GamesEndpoint)

    /* Default 404 handler */

    r.all('*', (_, res: Response) => ReqError.endpointNotFound(res))
  }

}

