/*
 * LOAD AND PREPARE CONFIGURATION
 */

/* eslint-disable import/first, import/order, no-console */
import { configjs } from './types/config'
export const config = require('../config.js') as configjs

function invalidConfig(reason: string) {
  console.error(`Could not start bot for reason config invalid: ${reason}`)
  process.exit(-1)
}

if (!config.mongoDB?.url) invalidConfig('missing mongodb url')
if (!config.mongoDB?.dbName) invalidConfig('missing mongodb dbname')
if (!config.mode?.name) invalidConfig('missing mode')
if (!config.bot?.token) invalidConfig('missing bot token')
if (!config.bot?.clientId) invalidConfig('missing bot client id')
if (!config.bot?.mode) invalidConfig('missing bot mode')
if (!config.apiSettings?.key) invalidConfig('missing freestuff api key')

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
        key.slice(item.length + 1),
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


import { Localisation } from '@freestuffbot/common'
import * as chalk from 'chalk'
import { FreeStuffApi } from 'freestuff'
import FreeStuffBot from './freestuffbot'
import SentryManager from './thirdparty/sentry/sentry'
import { GitCommit, logVersionDetails } from './lib/git-parser'
import MongoAdapter from './database/mongo-adapter'
import Database from './database/database'
import Redis from './database/redis'
import Logger from './lib/logger'
import Manager from './controller/manager'
import Server from './controller/server'
import Cordo from 'cordo'
import RemoteConfig from './controller/remote-config'
import { WorkerAction } from './types/controller'
import DatabaseManager from './bot/database-manager'
import { Options } from 'discord.js'
import Metrics from './lib/metrics'


// eslint-disable-next-line import/no-mutable-exports
export let Core: FreeStuffBot
// eslint-disable-next-line import/no-mutable-exports
export let FSAPI: FreeStuffApi
// eslint-disable-next-line import/no-mutable-exports
export let VERSION: string

async function run() {
  if (config.bot.mode === 'dev')
    Logger.info(chalk.bgRedBright.black(' RUNNING DEV MODE '))

  SentryManager.init()
  const commit = await logVersionDetails()
  VERSION = commit.shortHash

  await MongoAdapter.connect(config.mongoDB.url)

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
      mountBot(action.task?.ids, action.task?.total)
  }
}

run().catch((err) => {
  Logger.error('Error in main:')
  console.trace(err)
})

//

function initComponents(commit: GitCommit, action: WorkerAction) {
  Logger.excessive('<index>#initComponents')
  Metrics.init()

  reloadLanguages()
  setInterval(reloadLanguages, 1000 * 60 * 60 * 24)

  Cordo.init({
    botId: config.bot.clientId,
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
  Cordo.addMiddlewareInteractionCallback((data, guild) => Localisation.translateObject(data, guild, data._context, 14))
  Cordo.setMiddlewareGuildData(guildid => DatabaseManager.getGuildData(guildid))
  Cordo.setMiddlewareApiResponseHandler(res => Metrics.counterApiResponses.labels({ status: res.status }).inc())

  FSAPI = new FreeStuffApi({
    ...config.apiSettings as any,
    version: commit.shortHash,
    sid: action.id === 'startup' ? (action.task?.ids?.[0] || '0') : 'err'
  })

  if (config.server?.enable)
    Server.start(config.server)
}

// TODO place this method somewhere propper
export function reloadLanguages() {
  Database
    .collection('language')
    ?.find({ _enabled: true })
    .sort({ _id: 1 })
    .toArray()
    .then(data => Localisation.load(data))
}

function mountBot(shardIds: number[], shardCount: number) {
  Logger.excessive('<index>#mountBot')
  Core = new FreeStuffBot({
    ws: {
    },
    intents: [
      'GUILDS'
    ],
    allowedMentions: {},
    makeCache: Options.cacheWithLimits({
      ...Options.defaultMakeCacheSettings,
      ApplicationCommandManager: 30,
      BaseGuildEmojiManager: 0,
      GuildBanManager: 0,
      GuildInviteManager: 0,
      GuildMemberManager: 2,
      GuildStickerManager: 0,
      MessageManager: 2,
      PresenceManager: 0,
      ReactionManager: 0,
      ReactionUserManager: 0,
      StageInstanceManager: 0,
      ThreadManager: 0,
      ThreadMemberManager: 0,
      UserManager: 2,
      VoiceStateManager: 0
    }),
    // restGlobalRateLimit: 50 / Manager.getMeta().workerCount,
    partials: [],
    shardCount,
    shards: (shardIds !== undefined) ? shardIds : undefined
  })
  Core.start()
}
