/*
 * LOAD AND PREPARE CONFIGURATION
 */

/* eslint-disable import/first, import/order, no-console */
import { config as loadDotEnv } from 'dotenv'
import { configjs } from './types/config'
loadDotEnv()
export const config = require('../config.js') as configjs

function invalidConfig(reason: string) {
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

// load cmdl config overrides
import ParseArgs from './lib/parse-args'
if (process.argv) {
  try {
    const args = ParseArgs.parse(process.argv)

    const overrideConfig = (key: string, value: string | boolean | number, conf: any) => {
      if (!key.includes('.')) {
        conf[key] = value
        return
      }

      const item = key.split('.')[0]
      overrideConfig(
        key.substr(item.length + 1),
        value,
        conf[item]
      )
    }

    Object
      .entries(args)
      .filter(a => !a[0].startsWith('_'))
      .map(a => overrideConfig(a[0], a[1], config))
  } catch (ex) {
    console.error(ex)
    console.error('Issue parsing argv, ignoring cmdline arguments')
  }
}
// eslint-enable no-console


/*
 * WAIT FOR MANAGER ASSIGNMENT, THEN START INSTANCE(s)
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
import RemoteConfig from './controller/remote-config'
import { WorkerAction } from './types/controller'
import DatabaseManager from './bot/database-manager'


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

  DatabaseManager.init()

  const action = await Manager.ready()

  switch (action.id) {
    case 'shutdown':
      Logger.info('Shutting down.')
      process.exit(0)

    case 'startup':
      initComponents(commit, action)
      mountBot(action.task.ids, action.task.total)
  }
}

run().catch((err) => {
  Logger.error('Error in main:')
  Logger.error(err)
})

//

function initComponents(commit: GitCommit, action: WorkerAction) {
  Logger.excessive('<index>#initComponents')
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
  Cordo.setMiddlewareGuildData((guildid: string) => DatabaseManager.getGuildData(guildid))

  FSAPI = new FreeStuffApi({
    ...config.apisettings as any,
    version: commit.shortHash,
    sid: action.id === 'startup' ? action.task.ids[0] : 'err'
  })

  if (config.apisettings.server?.enable)
    WebhookServer.start(config.apisettings.server)
}

function mountBot(shardIds: number[], shardCount: number) {
  Logger.excessive('<index>#mountBot')
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
    fetchAllMembers: false,
    messageEditHistoryMaxSize: 1,
    shardCount,
    shards: (shardIds !== undefined) ? shardIds : undefined
  })
  Core.start()
}
