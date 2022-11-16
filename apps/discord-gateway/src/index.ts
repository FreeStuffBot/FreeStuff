/* eslint-disable import/order, import/first */
import { configjs } from './types/config'
export const config = require('../config.js') as configjs

//

import { ContainerInfo, Logger } from '@freestuffbot/common'
import RestGateway from './api/rest-gateway'
import Modules from './modules'


async function run() {
  Logger.log('Starting...')
  ContainerInfo.printVersion()

  RestGateway.startLoop()
  Modules.initMetrics()
  await Modules.startServer()
  Modules.startPurgeTask()
}

run().catch((err) => {
  Logger.error('Error in main:')
  // eslint-disable-next-line no-console
  console.trace(err)
})
