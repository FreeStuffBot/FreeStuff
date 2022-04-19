import * as cors from 'cors'
import { Response, Router } from 'express'
import { config } from '../..'
import ReqError from '../../lib/reqerror'
import { rateLimiter as limit } from '../../middleware/rate-limits'
import pagination from '../../middleware/pagination'

import { getAnnouncement } from './announcements'
import { apiGateway } from '../../middleware/api-gateway'


export default class V2Router {

  private static ctx: Router

  public static init(): Router {
    this.ctx = Router()
    this.addRoutes()

    return this.ctx
  }

  private static addRoutes() {
    const r = this.ctx

    /* GATEWAY */

    r.all('*', apiGateway('v2'))


    /* ENDPOINTS */

    // ping
    r.all(   '/ping', limit(10, 60), () => {})

    // announcements
    r.get(   '/announcements/:announcement', limit(5, 1), getAnnouncement)


    /* Default 404 handler */

    r.all('*', (_, res: Response) => ReqError.notFound(res, 'Endpoint Not Found'))
  }

}
