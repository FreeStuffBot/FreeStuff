import * as cors from 'cors'
import { Response, Router } from 'express'
import { config } from '../..'
import ReqError from '../../lib/req-error'
import fw from '../../middleware/dash-gateway'
import { rateLimiter as limit } from '../../middleware/rate-limits'
import pagination from '../../middleware/pagination'

import { getLogin, getMe, postCode } from './auth'
import { getProduct, getProducts, patchProduct, postProduct, postProductRefetch } from './content/products'
import { deletePlatform, getPlatforms, patchPlatform, postPlatform } from './content/platforms'
import { deleteCurrency, getCurrencies, patchCurrency, postCurrency } from './content/currencies'
import { deleteExperiment, getExperiments, patchExperiment, postExperiment } from './admin/experiments'
import { getConfig, patchConfig } from './admin/config'
import { postAnnouncement } from './content/announcements'
import { getServices, postServicesCommand } from './admin/services'
import { getApp, patchAppDescription, patchAppWebhook, postApp, postAppKeyRegen, postAppWebhookTest } from './api/app'
import { postInternalCommand } from './admin/internal'
import { getTranslationsApplications, getTranslationsApplicationsStatus, patchTranslationsApplication, postTranslationsApplication } from './translations/applications'
import { postNotificationRead } from './notifications'
import { getLanguage, getLanguages, getLanguagesPreview } from './translations/languages'
import { getComments, patchCommentVote, postComment } from './translations/comments'
import { postLine } from './translations/lines'
import { deleteUser, getUsers, patchUser, postUser } from './admin/users'


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
    r.all(   '/ping',    limit(10, 60*60),            fw('[everyone]'), () => {})

    // auth
    r.get(   '/auth/login/:provider',              fw('[everyone]'),        getLogin)
    r.post(  '/auth/code/:provider',               fw('[everyone]'),        postCode)
    r.get(   '/auth/me',                           fw('[logged_in]'),       getMe)

    // translations
    r.post(  '/translations/lines',                fw('admin'),             postLine)
    r.get(   '/translations/applications',         fw('admin|contentmod'),  getTranslationsApplications)
    r.post(  '/translations/applications',         fw('[logged_in]'),       postTranslationsApplication)
    r.get(   '/translations/applications/@me',     fw('[logged_in]'),       getTranslationsApplicationsStatus)
    r.patch( '/translations/applications/:id',     fw('admin|contentmod'),  patchTranslationsApplication)
    r.get(   '/translations/languages-preview',    fw('[logged_in]'),       getLanguagesPreview)
    r.get(   '/translations/languages',            fw('admin|translate.*'), getLanguages)
    r.get(   '/translations/languages/:language',  fw('admin|translate.*'), getLanguage)
    r.patch( '/translations/comments/:id',             limit(10, 30),               fw('admin|translate.*'), patchCommentVote)
    r.get(   '/translations/comments/:language/:line', limit(8, 5),                 fw('admin|translate.{language}'), getComments)
    r.post(  '/translations/comments/:language/:line', limit(2, 60 * 60, '{line}'), fw('admin|translate.{language}'), postComment)

    // notifications
    r.post( '/notifications/:notification/read',   fw('[logged_in]'),       postNotificationRead)

    // api apps
    r.get(   '/app',                               fw('admin|api'), getApp)
    r.post(  '/app',                               fw('admin|api'), postApp)
    r.post(  '/app/key/regen',                     fw('admin|api'), postAppKeyRegen)
    r.patch( '/app/webhook',                       fw('admin|api'), patchAppWebhook)
    r.post(  '/app/webhook/test',                  fw('admin|api'), postAppWebhookTest)
    r.patch( '/app/description',                   fw('admin|api'), patchAppDescription)

    // content
    r.get(   '/content/products',                  fw('admin|contentmod'),  pagination(20, 40), getProducts)
    r.get(   '/content/products/:product',         fw('admin|contentmod'),  getProduct)
    r.post(  '/content/products',                  fw('admin|contentmod'),  postProduct)
    r.patch( '/content/products/:product',         fw('admin|contentmod'),  patchProduct)
    r.post(  '/content/products/:product/refetch', fw('admin|contentmod'),  postProductRefetch)

    r.post(  '/content/announcements',             fw('admin|contentmod'),  postAnnouncement)

    r.get(   '/content/platforms',                 fw('admin|contentmod'),  pagination(50, 50), getPlatforms)
    r.post(  '/content/platforms',                 fw('admin'),             postPlatform)
    r.patch( '/content/platforms/:platform',       fw('admin'),             patchPlatform)
    r.delete('/content/platforms/:platform',       fw('admin'),             deletePlatform)

    r.get(   '/content/currencies',                fw('admin|contentmod'),  pagination(50, 50), getCurrencies)
    r.post(  '/content/currencies',                fw('admin'),             postCurrency)
    r.patch( '/content/currencies/:currency',      fw('admin'),             patchCurrency)
    r.delete('/content/currencies/:currency',      fw('admin'),             deleteCurrency)

    // admin
    r.get(   '/admin/experiments',                 fw('admin'),             getExperiments)
    r.post(  '/admin/experiments',                 fw('admin'),             postExperiment)
    r.patch( '/admin/experiments/:experiment',     fw('admin'),             patchExperiment)
    r.delete('/admin/experiments/:experiment',     fw('admin'),             deleteExperiment)

    r.get(   '/admin/config/:config',              fw('admin'),             getConfig)
    r.patch( '/admin/config/:config',              fw('admin'),             patchConfig)

    r.get(   '/admin/services',                    fw('admin'),             getServices)
    r.post(  '/admin/services/command',            fw('admin'),             postServicesCommand)

    r.get(   '/admin/users',                       fw('admin'),             getUsers)
    r.post(  '/admin/users',                       fw('admin'),             postUser)
    r.patch( '/admin/users/:user',                 fw('admin'),             patchUser)
    r.delete('/admin/users/:user',                 fw('admin'),             deleteUser)

    r.post(  '/admin/internal/command',            fw('admin'),             postInternalCommand)


    /* Default 404 handler */

    r.all('*', (_, res: Response) => ReqError.notFound(res, 'Endpoint Not Found'))
  }

}
