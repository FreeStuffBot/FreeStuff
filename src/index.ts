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
import { FreeStuffApi } from 'freestuff'
import FreeStuffBot from './freestuffbot'
import SentryManager from './thirdparty/sentry/sentry'
import { GitCommit, logVersionDetails } from './lib/git-parser'
import MongoAdapter from './database/mongo-adapter'
import Database from './database/database'
import Redis from './database/redis'
import Logger from './lib/logger'
import { Util } from './lib/util'
import Manager from './controller/manager'
import LanguageManager from './bot/language-manager'
import WebhookServer from './controller/webhookserver'
import Cordo from './cordo/cordo'
import { ShardAction } from './types/controller'


// eslint-disable-next-line import/no-mutable-exports
export let Core: FreeStuffBot
// eslint-disable-next-line import/no-mutable-exports
export let FSAPI: FreeStuffApi

async function run() {
  if (config.bot.mode === 'dev')
    Logger.info(chalk.bgRedBright.black(' RUNNING DEV MODE '))

  SentryManager.init()
  const commit = await logVersionDetails()
  Util.init()

  await MongoAdapter.connect(config.mongodb.url)

  Logger.process('Connected to Mongo')

  Database.init()
  Redis.init()

  const action = await Manager.ready()

  switch (action.id) {
    case 'shutdown':
      Logger.info('Shutting down.')
      process.exit(0)

    case 'startup':
      initComponents(commit, action)
      mountBot(action.shardId, action.shardCount)
  }
}

run().catch((err) => {
  Logger.error('Error in main:')
  Logger.error(err)
})

//

function initComponents(commit: GitCommit, action: ShardAction) {
  LanguageManager.init()

  Cordo.findContext([ __dirname, 'bot' ])
  Cordo.registerMiddlewareForInteractionCallback((data, guild) => LanguageManager.translateObject(data, guild, data._context, 10))

  FSAPI = new FreeStuffApi({
    ...config.apisettings as any,
    version: commit.shortHash,
    sid: action.id === 'startup' ? action.shardId : 'err'
  })

  if (config.apisettings.server?.enable)
    WebhookServer.start(config.apisettings.server)
}

function mountBot(shardId: number, shardCount: number) {
  // if (Core) {
  //   // unmount old bot
  //   Core.removeAllListeners()
  //   Core.destroy()
  //   return
  // }

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
  Core.start()
}
