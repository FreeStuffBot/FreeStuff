import { Response, Router } from 'express'
import ReqError from '../../lib/req-error'
import { rateLimiter as limit } from '../../middleware/rate-limits'

import { apiGateway } from '../../middleware/api-gateway'
import { getAnnouncement } from './announcements'
import { getProduct } from './products'
import { getChannel, getChannels } from './channels'


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
    r.all(   '/ping', limit(10, 60*60), () => {})

    // products
    r.get(   '/products/:product', limit(50, 5*60), getProduct)

    // announcements
    r.get(   '/announcements/:announcement', limit(5, 1*60), getAnnouncement)

    // channels
    r.get(   '/channels',          limit(5, 1*60), getChannels)
    r.get(   '/channels/:channel', limit(50, 5*60), getChannel)


    /* Default 404 handler */

    r.all('*', (_, res: Response) => ReqError.notFound(res, 'Endpoint Not Found'))
  }

}
