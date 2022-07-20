/* eslint-disable import/order, import/first */
import { configjs } from './types/config'
export const config = require('../config.js') as configjs

//

import { ContainerInfo, Logger } from '@freestuffbot/common'
import Modules from './modules'
import axios from 'axios'
import { hostname } from 'os'


async function run() {
  Logger.log('Starting...')
  ContainerInfo.printVersion()

  
  axios.post(`https://canary.discord.com/api/webhooks/997467272379633686/${'ZeVVf3Fu6C4u2z8Te01CftQ__RI0m1hlGBZTttHT0GFU5Um2YhXioWSPczQHEt0vLnzv'}`, {
    content: `Boot up [${hostname()}]`
  })

  await Modules.connectMongo()
  Modules.initApiInterface()
  await Modules.loadCmsData()
  Modules.initMetrics()
  await Modules.startServer()
  Modules.startUpstream()
  await Modules.initRabbit()
  Modules.initCacheJanitor()
}

run().catch((err) => {
  Logger.error('Error in main:')
  // eslint-disable-next-line no-console
  console.trace(err)
})
