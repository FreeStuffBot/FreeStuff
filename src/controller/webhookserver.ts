import * as express from 'express'
import { FreeStuffApiServerConfig } from '../types/config'
import { FSAPI } from '../index'
import Logger from '../lib/logger'


export default class WebhookServer {

  public static start(config: FreeStuffApiServerConfig) {
    if (!config?.enable) return
    if (!config.port) {
      config.port = 8080
      Logger.warn('Server enabled but no port specified. Server is now trying to launch on port 8080.')
    }
    if (!config.endpoint)
      config.endpoint = '/webhook'

    const app = express()
    app.set('trust proxy', 1)
    app.use(config.endpoint, express.json())
    app.use(config.endpoint, FSAPI.webhook())

    FSAPI.on('webhook_test', () => {
      Logger.info('Webhook test received!')
    })

    app.listen(config.port, undefined, () => {
      Logger.process(`Server launched. Configure your webhook url to point at https://[host]:${config.port}${config.endpoint}`)
    })
  }

}
