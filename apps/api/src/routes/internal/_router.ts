import * as cors from 'cors'
import { Response, Router } from 'express'
import { config } from '../..'
import ReqError from '../../lib/req-error'
import { rateLimiter as limit } from '../../middleware/rate-limits'

import { apiGateway } from '../../middleware/api-gateway'
import { getCmsConstants, getExperiments, getLanguages, getRemoteConfig } from './data'


export default class InternalRouter {

  private static ctx: Router

  public static init(): Router {
    this.ctx = Router()
    this.addRoutes()

    return this.ctx
  }

  private static addRoutes() {
    const r = this.ctx

    /* GATEWAY */

    r.all('*', apiGateway('internal', true))


    /* ENDPOINTS */

    // ping
    r.all(   '/ping', limit(10, 60), () => {})

    // announcements
    r.get('/data/languages', getLanguages)
    r.get('/data/cms-constants', getCmsConstants)
    r.get('/data/remote-config', getRemoteConfig)
    r.get('/data/experiments', getExperiments)


    /* Default 404 handler */

    r.all('*', (_, res: Response) => ReqError.notFound(res, 'Endpoint Not Found'))
  }

}
