import { configjs } from './types/config'
export const config = require('../config.js') as configjs

//

import { Logger } from '@freestuffbot/common'
import Modules from './modules'


async function run() {
  Logger.log('Starting...')

  await Modules.connectMongo()
  await Modules.initRabbit()
  Modules.initApiInterface()
  // Modules.loadCmsData() // no need for any cms data at the moment, skipping
  Modules.startUpstream()
  Modules.initCacheJanitor()
}

run().catch((err) => {
  Logger.error('Error in main:')
  console.trace(err)
})
