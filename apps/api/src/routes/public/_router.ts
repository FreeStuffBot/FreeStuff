import { Response, Router } from 'express'
import ReqError from '../../lib/req-error'
import { rateLimiter as limit } from '../../middleware/rate-limits'

import { apiGateway } from '../../middleware/api-gateway'
import { getBuildWeb } from './ci'
import { getDonors } from './web'


export default class PublicRouter {

  private static ctx: Router

  public static init(): Router {
    this.ctx = Router()
    this.addRoutes()

    return this.ctx
  }

  private static addRoutes() {
    const r = this.ctx

    /* GATEWAY */

    r.all('*', apiGateway('public'))


    /* ENDPOINTS */

    // ci
    r.get('/ci/build-web', getBuildWeb)

    // web
    r.get('/web/donors', limit(1, 1), getDonors)
    

    /* Default 404 handler */

    r.all('*', (_, res: Response) => ReqError.notFound(res, 'Endpoint Not Found'))
  }

}
