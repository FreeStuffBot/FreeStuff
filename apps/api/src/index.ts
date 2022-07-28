/* eslint-disable import/order, import/first */
import { configjs } from './types/config'
export const config = require('../config.js') as configjs

//

import { ContainerInfo, Logger } from '@freestuffbot/common'
import Modules from './modules'
import RabbitHole, { TaskId } from '@freestuffbot/rabbit-hole'


async function run() {
  Logger.log('Starting...')
  ContainerInfo.printVersion()

  await Modules.initRabbit()
  await Modules.connectMongo()
  Modules.connectGibu()
  Modules.startServer()
  Modules.startRoutines()

  await RabbitHole.publish({
    t: TaskId.DISCORD_PUBLISH_SPLIT,
    a: 123,
    c: 1300,
    v: 0
  })

  setInterval(async () => {
    console.log('START')
    await RabbitHole.publish({
      t: TaskId.DISCORD_TEST,
      g: "123123"
    })
    console.log('PUBLISHED')
  }, 5000)
}

run().catch((err) => {
  Logger.error('Error in main:')
  // eslint-disable-next-line no-console
  console.trace(err)
})
