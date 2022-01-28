import * as cors from 'cors'
import { Response, Router } from 'express'
import { getLogin, getMe, postCode } from './auth'
import fw from '../../middleware/dash-gateway'
import ReqError from '../../lib/reqerror'
import { rateLimiter as limit } from '../../middleware/rate-limits'


export default class DashRouter {

  private static ctx: Router

  public static init(): Router {
    this.ctx = Router()
    this.addRoutes()

    return this.ctx
  }

  private static addRoutes() {
    const r = this.ctx

    /* CORS */

    r.use('*', cors({ origin: process.env.NODE_ENV !== 'development' ? 'https://dashboard.freestuffbot.xyz' : 'http://localhost:5522' }))


    /* ENDPOINTS */

    // ping
    r.all('/ping', limit(10, 60), fw('[everyone]'), () => {})

    // auth
    r.get('/auth/login/:provider',  fw('[everyone]'),               getLogin)
    r.post('/auth/code/:provider',  fw('[everyone]'),               postCode)
    r.get('/auth/me',               fw('[logged_in]'),  getMe)


    /* Default 404 handler */

    r.all('*', (_, res: Response) => ReqError.notFound(res, 'Endpoint Not Found'))
  }

}
