import * as cors from 'cors'
import { Response, Router } from 'express'
import { config } from '../..'
import ReqError from '../../lib/req-error'
import fw from '../../middleware/dash-gateway'
import { rateLimiter as limit } from '../../middleware/rate-limits'
import pagination from '../../middleware/pagination'

import { getLogin, getMe, postCode } from './auth'
import { getLanguage, getLanguages } from './translations/languages'
import { getProduct, getProducts, patchProduct, postProduct } from './content/products'
import { deletePlatform, getPlatforms, patchPlatform, postPlatform } from './content/platforms'
import { deleteCurrency, getCurrencies, patchCurrency, postCurrency } from './content/currencies'
import { deleteExperiment, getExperiments, patchExperiment, postExperiment } from './admin/experiments'
import { getConfig, patchConfig } from './admin/config'
import { postAnnouncement } from './content/announcements'
import { getServices } from './admin/services'
import { getApp, patchAppDescription, patchAppWebhook, postApp, postAppKeyRegen, postAppWebhookTest } from './api/app'


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
    r.all(   '/ping',    limit(10, 60),        fw('[everyone]'), () => {})

    // auth
    r.get(   '/auth/login/:provider',          fw('[everyone]'),        getLogin)
    r.post(  '/auth/code/:provider',           fw('[everyone]'),        postCode)
    r.get(   '/auth/me',                       fw('[logged_in]'),       getMe)

    // translations
    r.get(   '/translations/languages',        fw('admin|translate.*'), getLanguages)
    r.get(   '/translations/languages/:id',    fw('admin|translate.*'), getLanguage)
    // r.patch( '/translations/languages/:id',    fw('admin|translate.{id}'), TODO)

    // api apps
    r.get(   '/app',                           fw('admin|api'), getApp)
    r.post(  '/app',                           fw('admin|api'), postApp)
    r.post(  '/app/key/regen',                 fw('admin|api'), postAppKeyRegen)
    r.patch( '/app/webhook',                   fw('admin|api'), patchAppWebhook)
    r.post(  '/app/webhook/test',              fw('admin|api'), postAppWebhookTest)
    r.patch( '/app/description',               fw('admin|api'), patchAppDescription)

    // content
    r.get(   '/content/products',              fw('admin|contentmod'),  pagination(20, 40), getProducts)
    r.get(   '/content/products/:product',     fw('admin|contentmod'),  getProduct)
    r.post(  '/content/products',              fw('admin|contentmod'),  postProduct)
    r.patch( '/content/products/:product',     fw('admin|contentmod'),  patchProduct)

    r.post(  '/content/announcements',         fw('admin|contentmod'),  postAnnouncement)

    r.get(   '/content/platforms',             fw('admin|contentmod'),  pagination(50, 50), getPlatforms)
    r.post(  '/content/platforms',             fw('admin'),             postPlatform)
    r.patch( '/content/platforms/:platform',   fw('admin'),             patchPlatform)
    r.delete('/content/platforms/:platform',   fw('admin'),             deletePlatform)

    r.get(   '/content/currencies',            fw('admin|contentmod'),  pagination(50, 50), getCurrencies)
    r.post(  '/content/currencies',            fw('admin'),             postCurrency)
    r.patch( '/content/currencies/:currency',  fw('admin'),             patchCurrency)
    r.delete('/content/currencies/:currency',  fw('admin'),             deleteCurrency)

    // admin
    r.get(   '/admin/experiments',             fw('admin'),             getExperiments)
    r.post(  '/admin/experiments',             fw('admin'),             postExperiment)
    r.patch( '/admin/experiments/:experiment', fw('admin'),             patchExperiment)
    r.delete('/admin/experiments/:experiment', fw('admin'),             deleteExperiment)

    r.get(   '/admin/config',                  fw('admin'),             getConfig)
    r.patch( '/admin/config',                  fw('admin'),             patchConfig)

    r.get(   '/admin/services',                fw('admin'),             getServices)


    /* Default 404 handler */

    r.all('*', (_, res: Response) => ReqError.notFound(res, 'Endpoint Not Found'))
  }

}
