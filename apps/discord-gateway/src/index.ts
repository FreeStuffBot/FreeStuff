import { ContainerInfo, Logger, UmiLibs } from '@freestuffbot/common'
import RestGateway from './api/rest-gateway'
import Modules from './modules'
import { configjs } from './types/config'

export const config = require('../config.js') as configjs

async function run() {
  Logger.log('Starting...')
  ContainerInfo.printVersion()

  RestGateway.startLoop()
  Modules.initMetrics()
  await Modules.startServer()

  Logger.debug('Starting Handshake')
  await UmiLibs.performHandshakeOrDie()
  Logger.debug('Handshake Complete')
}

run().catch((err) => {
  Logger.error('Error in main:')
  console.trace(err)
})
