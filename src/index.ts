/* eslint-disable import/first, import/order */
import { config as loadDotEnv } from 'dotenv'
import { configjs } from './types/config'
loadDotEnv()
export const config = require('../config.js') as configjs

function invalidConfig(reason: string) {
  // eslint-disable-next-line no-console
  console.error(`Could not start bot for reason config invalid: ${reason}`)
  process.exit(-1)
}

if (!config.mongodb?.url) invalidConfig('missing mongodb url')
if (!config.mongodb?.dbname) invalidConfig('missing mongodb dbname')
if (!config.mode?.name) invalidConfig('missing mode')
if (!config.bot?.token) invalidConfig('missing bot token')
if (!config.bot?.clientid) invalidConfig('missing bot client id')
if (!config.bot?.mode) invalidConfig('missing bot mode')
if (!config.apisettings?.key) invalidConfig('missing freestuff api key')


/*
 *
 */


import * as chalk from 'chalk'
import FreeStuffBot from './freestuffbot'
import SentryManager from './thirdparty/sentry/sentry'
import { GitCommit, logVersionDetails } from './util/git-parser'
import MongoAdapter from './database/mongo-adapter'
import Database from './database/database'
import Redis from './database/redis'
import Logger from './util/logger'
import { Util } from './util/util'
import Manager from './controller/manager'


// eslint-disable-next-line import/no-mutable-exports
export let Core: FreeStuffBot

async function run() {
  try {
    if (config.bot.mode === 'dev')
      Logger.info(chalk.bgRedBright.black(' RUNNING DEV MODE '))

    SentryManager.init()
    const commit = await logVersionDetails()
    Util.init()

    await MongoAdapter.connect(config.mongodb.url)

    Logger.process('Connected to Mongo')

    await Database.init()
    await Redis.init()

    const action = await Manager.ready()

    switch (action.id) {
      case 'shutdown':
        Logger.info('Shutting down.')
        process.exit(0)

      case 'startup':
        mountBot(action.shardId, action.shardCount, commit)

    }
  } catch (err) {
    Logger.error('Error in main:')
    Logger.error(err)
  }
}
run()

//

function mountBot(shardId: number, shardCount: number, commit: GitCommit) {
  Core = new FreeStuffBot({
    ws: {
      intents: [
        'GUILDS',
        'GUILD_MESSAGES'
      ]
    },
    disableMentions: 'none',
    messageSweepInterval: 2,
    messageCacheLifetime: 0,
    messageCacheMaxSize: 0,
    shardCount,
    shards: (shardId !== undefined) ? [ shardId ] : undefined
  })
  Core.start(commit)
}
