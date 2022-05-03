import { configjs } from './types/config'
export const config = require('../config.js') as configjs

import { ContainerVersion, Logger } from '@freestuffbot/common'
import Modules from './modules'


async function run() {
  Logger.log('Starting...')
  ContainerVersion.printVersion()

  await Modules.initRabbit()
  await Modules.connectMongo()
  Modules.connectGibu()
  Modules.startServer()
  Modules.startRoutines()
}

run().catch((err) => {
  Logger.error('Error in main:')
  console.trace(err)
})
