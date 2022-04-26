import { configjs } from './types/config'
export const config = require('../config.js') as configjs

import { Logger } from '@freestuffbot/common'
import Modules from './modules'


async function run() {
  Logger.log('Starting...')

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
