import { hostname } from 'os'
import { io, Socket } from 'socket.io-client'
import { Long } from 'mongodb'
import { config, Core } from '../index'
import Logger from '../lib/logger'
import { Experiment, ManagerCommand, ShardAction, ShardStatus, ShardTask } from '../types/controller'
import { getGitCommit } from '../lib/git-parser'
import { Util } from '../lib/util'
import NewFreeCommand from '../bot/commands/free'
import Experiments from './experiments'
import RemoteConfig from './remote-config'


/**
 * The Manager decides how to start and operate the bot.
 */
export default class Manager {

  private static readonly DEFAULT_SOCKET_HOST = 'wss://management.freestuffbot.xyz'
  private static readonly DEFAULT_SOCKET_PATH = '/api/internal/socket'

  private static started = false
  private static socket: Socket = null
  private static assignmentPromise: (any) => any = null
  private static assignedShardId = -1
  private static assignedShardCount = -1
  private static currentStatus: ShardStatus = 'idle'
  private static selfUUID = Manager.generateSelfUUID()
  private static disconnectedForTooLong: any = null

  private static readonly IDLE_TIMEOUT = 60 * 1000

  public static ready(): Promise<ShardAction> {
    if (this.started) throw new Error('Already started')
    this.started = true

    if (config.mode.name === 'single') {
      return Promise.resolve({
        id: 'startup',
        shardCount: undefined,
        shardId: undefined
      })
    }

    if (config.mode.name === 'shard') {
      return Promise.resolve({
        id: 'startup',
        shardCount: config.mode.shardCount,
        shardId: config.mode.shardId
      })
    }

    if (config.mode.name === 'discovery') {
      this.openSocket()
      return new Promise((res) => {
        this.assignmentPromise = (data: any) => res(data)
      })
    }

    Logger.error('Invalid mode name, shutting down')
    return Promise.resolve({ id: 'shutdown' })
  }

  public static status(status: ShardStatus) {
    Logger.info(`Service status: ${status}`)
    this.currentStatus = status
    if (!this.socket) return
    this.socket.emit('status', status)
  }

  private static async openSocket() {
    if (config.mode.name !== 'discovery') return // for type safety below

    const socketHost = config.mode.master.host || this.DEFAULT_SOCKET_HOST
    const socketPath = config.mode.master.path || this.DEFAULT_SOCKET_PATH
    const gitCommit = await getGitCommit()

    this.socket = io(socketHost, {
      reconnectionDelayMax: 10000,
      reconnectionDelay: 1000,
      query: {
        type: 'shard',
        client: 'discord',
        mode: config.bot.mode,
        version: gitCommit.hash,
        server: hostname(),
        id: this.selfUUID
      },
      path: socketPath,
      jsonp: false,
      transports: [ 'websocket' ],
      auth: {
        key: config.mode.master.auth || config.apisettings.key
      }
    })

    this.prepareSocket()

    Logger.process('Connecting to manager socket...')
    this.socket.connect()
  }

  private static prepareSocket() {
    this.socket.on('connect', () => {
      Logger.process('Manager socket connected')
      this.socket.emit('status', this.currentStatus)

      if (this.disconnectedForTooLong) {
        clearTimeout(this.disconnectedForTooLong)
        this.disconnectedForTooLong = null
      }
    })

    this.socket.on('disconnect', () => {
      Logger.process('Manager socket disconnected')

      this.disconnectedForTooLong = setTimeout(() => {
        Logger.warn('Socket connection timed out. Restarting.')
        this.runCommand({ id: 'shutdown' })
      }, this.IDLE_TIMEOUT)
    })

    this.socket.on('reconnect', () => {
      this.socket.emit('status', this.currentStatus)
    })

    this.socket.on('task', (task: ShardTask) => {
      this.newTask(task)
    })

    this.socket.on('command', (cmd: ManagerCommand) => {
      this.runCommand(cmd)
    })

    this.socket.on('experiments', (experiments: Experiment[]) => {
      Experiments.updateExperiments(experiments)
    })

    this.socket.on('apievent', (event: any) => {
      Core?.fsapi.emitRawEvent(event, e => Logger.warn(`Unhandled FreeStuff Api Event ${e.event}`))
    })

    this.socket.on('config.global', (data: any) => {
      RemoteConfig.update(data)
    })
  }

  private static newTask(task: ShardTask) {
    Logger.process(`Manager assigned task: ${Object.values(task).join(', ')}`)

    if (task.id === 'ready') {
      Logger.process('Cannot undo connection, restarting')
      process.exit(0)
    }

    if (task.id === 'assigned') {
      if (!this.assignmentPromise) {
        if (this.assignedShardId !== task.shardId) {
          Logger.process('Reassignment to different shard id, restarting')
          process.exit(0)
        }
        if (this.assignedShardCount !== task.shardCount) {
          Logger.process('Reassignment to different shard count, restarting')
          process.exit(0)
        }
      } else {
        this.assignedShardCount = task.shardCount
        this.assignedShardId = task.shardId
        this.assignmentPromise({
          id: 'startup',
          shardCount: task.shardCount,
          shardId: task.shardId
        })
        this.assignmentPromise = null
      }
    }
  }

  private static async runCommand(cmd: ManagerCommand) {
    switch (cmd.id) {
      case 'shutdown':
        Logger.manager('Shutdown.')
        process.exit(0)

      case 'reload_lang':
        Logger.manager('Reload language cache.')
        LanguageManager.load()
        break

      case 'resend_to_guild':
        Logger.manager('Resend received')
        for (const guildid of cmd.guilds) {
          if (!Util.belongsToShard(Long.fromString(guildid))) continue
          const guildData = await Core.databaseManager.getGuildData(guildid)
          const freebies = NewFreeCommand.getCurrentFreebies()
          Core.messageDistributor.sendToGuild(guildData, freebies, false, false)
          Logger.manager(`Resent to ${guildid}`)
        }
        break

      default:
        Logger.manager(`Unhandled command received: ${JSON.stringify(cmd)}`)
        break
    }
  }

  private static generateSelfUUID(): string {
    const host = hostname()
    const timestamp = Date.now().toString(32)
    const random = Util.generateWord('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 6)
    return `${host}.${timestamp}.${random}`
  }

}
