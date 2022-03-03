import * as cors from 'cors'
import { Response, Router } from 'express'
import { getLogin, getMe, postCode } from './auth'
import fw from '../../middleware/dash-gateway'
import ReqError from '../../lib/reqerror'
import { rateLimiter as limit } from '../../middleware/rate-limits'
import { config } from '../..'
import { getLanguage, getLanguages } from './translations/languages'
import { getProduct, getProducts, postProduct } from './content/products'
import pagination from '../../middleware/pagination'


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

    r.use('*', cors({ origin: config.dashboardCorsOrigin }))


    /* ENDPOINTS */

    // ping
    r.all('/ping', limit(10, 60), fw('[everyone]'), () => {})

    // auth
    r.get('/auth/login/:provider',  fw('[everyone]'),   getLogin)
    r.post('/auth/code/:provider',  fw('[everyone]'),   postCode)
    r.get('/auth/me',               fw('[logged_in]'),  getMe)

    // translations
    r.get('/translations/languages',      fw('admin|translate.*'), getLanguages)
    r.get('/translations/languages/:id',  fw('admin|translate.*'), getLanguage)

    // content
    r.get('/content/products',          fw('admin|contentmod'), pagination(20, 40), getProducts)
    r.get('/content/products/:product', fw('admin|contentmod'), getProduct)
    r.post('/content/products',         fw('admin|contentmod'), postProduct)


    /* Default 404 handler */

    r.all('*', (_, res: Response) => ReqError.notFound(res, 'Endpoint Not Found'))
  }

}
