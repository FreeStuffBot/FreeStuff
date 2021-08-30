import * as express from 'express'
import { configjs } from '../types/config'
import { FSAPI } from '../index'
import Logger from '../lib/logger'
import Metrics from '../lib/metrics'


export default class Server {

  public static start(config: configjs['server']) {
    if (!config?.enable) return
    if (!config.port) {
      config.port = 8080
      Logger.warn('Server enabled but no port specified. Server is now trying to launch on port 8080.')
    }

    const app = express()
    app.set('trust proxy', 1)
    Server.mountEndpoints(app, config)

    FSAPI.on('webhook_test', () => {
      Logger.info('Webhook test received!')
    })

    app.listen(config.port, undefined, () => {
      Logger.process(`Server launched at port ${config.port}`)
    })
  }

  private static mountEndpoints(app: express.Express, config: configjs['server']) {
    if (config.endpoints?.apiWebhook) {
      let path = '/webhook'
      if (typeof config.endpoints.apiWebhook === 'string')
        path = config.endpoints.apiWebhook

      app.use(path, FSAPI.webhook())
      app.use(path, express.json())
    }

    if (config.endpoints?.metrics) {
      let path = '/metrics'
      if (typeof config.endpoints.metrics === 'string')
        path = config.endpoints.metrics
      app.use(path, Metrics.endpoint())
    }
  }

}
