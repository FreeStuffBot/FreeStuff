import { Response, Router } from 'express'
import ReqError from '../../lib/req-error'
import { rateLimiter as limit } from '../../middleware/rate-limits'

import { apiGateway } from '../../middleware/api-gateway'
import { getCmsConstants, getExperiments, getLanguages, getRemoteConfig } from './data'
import { allPing } from './ping'
import { postPublishingProgress } from './reporting'


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
    r.all(   '/ping', limit(10, 60), allPing)

    // announcements
    r.get('/data/languages', getLanguages)
    r.get('/data/cms-constants', getCmsConstants)
    r.get('/data/remote-config', getRemoteConfig)
    r.get('/data/experiments', getExperiments)

    // reporting
    r.post('/reporting/publishing-progress/:announcement', postPublishingProgress)


    /* Default 404 handler */

    r.all('*', (_, res: Response) => ReqError.notFound(res, 'Endpoint Not Found'))
  }

}
