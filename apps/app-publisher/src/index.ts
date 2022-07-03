/* eslint-disable import/order, import/first */
import { configjs } from './types/config'
export const config = require('../config.js') as configjs

//

import { ContainerInfo, Logger } from '@freestuffbot/common'
import Modules from './modules'


async function run() {
  Logger.log('Starting...')
  ContainerInfo.printVersion()

  await Modules.connectMongo()
  await Modules.initRabbit()
  Modules.initApiInterface()
  await Modules.loadCmsData()
  Modules.initMetrics()
  await Modules.startServer()
  Modules.startUpstream()
  Modules.initCacheJanitor()
}

run().catch((err) => {
  Logger.error('Error in main:')
  // eslint-disable-next-line no-console
  console.trace(err)
})
