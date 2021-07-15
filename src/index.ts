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
import Cordo from 'cordo'
import { ShardAction } from './types/controller'
import RemoteConfig from './controller/remote-config'


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

  Cordo.init({
    botId: config.bot.clientid,
    contextPath: [ __dirname, 'bot' ],
    botAdmins: (id: string) => RemoteConfig.botAdmins.includes(id),
    texts: {
      interaction_not_owned_title: '=interaction_not_owned_1',
      interaction_not_owned_description: '=interaction_not_owned_2',
      interaction_not_permitted_title: '=interaction_not_permitted_1',
      interaction_not_permitted_description_generic: '=interaction_not_permitted_2_generic',
      interaction_not_permitted_description_bot_admin: '=interaction_not_permitted_2_bot_admin',
      interaction_not_permitted_description_guild_admin: '=interaction_not_permitted_2_admin',
      interaction_not_permitted_description_manage_server: '=interaction_not_permitted_2_manage_server',
      interaction_not_permitted_description_manage_messages: '=interaction_not_permitted_2_manage_messages',
      interaction_failed: 'We are very sorry but an error occured while processing your command. Please try again.'
    }
  })
  Cordo.addMiddlewareInteractionCallback((data, guild) => LanguageManager.translateObject(data, guild, data._context, 14))
  Cordo.setMiddlewareGuildData((guildid: string) => Core?.databaseManager.getGuildData(guildid))

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
