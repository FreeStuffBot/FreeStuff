import { configjs } from './types/config'
export const config = require('../config.js') as configjs

//

import { Logger } from '@freestuffbot/common'
import Modules from './modules'


async function run() {
  Logger.log('Starting...')

  await Modules.connectMongo()
  await Modules.initRabbit()
  Modules.loadLanguageFiles()
}

run().catch((err) => {
  Logger.error('Error in main:')
  console.trace(err)
})
