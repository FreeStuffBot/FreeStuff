import { Logger } from '@freestuffbot/common'
import Modules from './modules'
import { configjs } from './types/config'

export const config = require('../config.js') as configjs

async function run() {
  Logger.log('Starting...')

  Modules.startServer()
}

run().catch((err) => {
  Logger.error('Error in main:')
  console.trace(err)
})
