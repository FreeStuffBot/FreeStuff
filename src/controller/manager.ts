import { hostname } from 'os'
import { io, Socket } from 'socket.io-client'
import { Long } from 'mongodb'
import { config, FSAPI, reloadLanguages } from '../index'
import Logger from '../lib/logger'
import { Experiment, WorkerCommand, ShardStatus, WorkerTask, WorkerAction, Shard } from '../types/controller'
import { getGitCommit } from '../lib/git-parser'
import MessageDistributor from '../bot/message-distributor'
import AnnouncementManager from '../bot/announcement-manager'
import DatabaseManager from '../bot/database-manager'
import { Util } from '../lib/util'
import Experiments from './experiments'
import RemoteConfig from './remote-config'


/**
 * The Manager decides how to start and operate the bot.
 */
export default class Manager {

  private static readonly DEFAULT_SOCKET_HOST = 'wss://management.freestuffbot.xyz'
  private static readonly DEFAULT_SOCKET_PATH = '/internal/socket'

  private static started = false
  private static socket: Socket = null
  private static assignmentPromise: (any) => any = null
  private static task: WorkerTask = null
  private static shards: Map<number, Shard> = new Map()
  private static selfUUID = Manager.generateSelfUUID()
  private static socketConnectionIdleTimeout: any = null
  private static meta: {
    workerIndex: number,
    workerCount: number
  } = {
    workerIndex: 0,
    workerCount: 1
  }

  private static readonly IDLE_TIMEOUT = 2 * 60 * 1000 // 2 minutes

  public static ready(): Promise<WorkerAction> {
    if (this.started) throw new Error('Already started')
    this.started = true
    Logger.excessive('Manager#ready')

    if (config.mode.name === 'single') {
      return Promise.resolve({
        id: 'startup',
        task: null
      })
    }

    if (config.mode.name === 'shard') {
      return Promise.resolve({
        id: 'startup',
        task: {
          ids: config.mode.shardIds,
          total: config.mode.shardCount
        }
      })
    }

    if (config.mode.name === 'worker') {
      this.openSocket()
      return new Promise((res) => {
        this.assignmentPromise = (data: any) => res(data)
      })
    }

    Logger.error('Invalid mode name, shutting down')
    return Promise.resolve({ id: 'shutdown' })
  }

  public static status(shard: number, status: ShardStatus) {
    if (config.mode.name !== 'worker') return

    if (shard === null) {
      Logger.info(`All shards status: ${status}`)
      for (const id of this.shards.keys())
        this.shards.get(id).status = status
    } else {
      Logger.info(`Shard ${shard} status: ${status}`)
      this.shards.get(shard).status = status
    }

    if (this.socket?.connected)
      this.socket.emit('status', { id: shard, status })
  }

  private static async openSocket() {
    Logger.excessive('Manager#openSocket')
    if (config.mode.name !== 'worker') return // for type safety below

    const socketHost = config.mode.master.host || this.DEFAULT_SOCKET_HOST
    const socketPath = config.mode.master.path || this.DEFAULT_SOCKET_PATH
    const gitCommit = await getGitCommit()

    this.socket = io(socketHost, {
      reconnectionDelayMax: 10000,
      reconnectionDelay: 1000,
      query: {
        type: 'worker',
        version: gitCommit.hash,
        container: hostname(),
        node: process.env.NODE_ID,
        id: this.selfUUID
      },
      path: socketPath,
      jsonp: false,
      transports: [ 'websocket' ],
      auth: {
        key: config.mode.master.auth || config.apiSettings.key
      }
    })

    this.prepareSocket()
    this.connectSocket()
  }

  private static connectSocket() {
    Logger.process('Connecting to manager socket...')

    if (this.socketConnectionIdleTimeout)
      clearTimeout(this.socketConnectionIdleTimeout)

    this.socketConnectionIdleTimeout = setTimeout(() => {
      Logger.warn('Socket connection timed out. Re-trying.')
      this.socket.disconnect()
      this.connectSocket()
    }, this.IDLE_TIMEOUT)

    this.socket.connect()
  }

  private static prepareSocket() {
    Logger.excessive('Manager#prepareSocket')

    this.socket.on('connect', () => {
      Logger.process('Manager socket connected')
      for (const shard of this.shards.values())
        this.socket.emit('status', { id: shard.id, status: shard.status })

      if (this.socketConnectionIdleTimeout) {
        clearTimeout(this.socketConnectionIdleTimeout)
        this.socketConnectionIdleTimeout = null
      }
    })

    this.socket.on('disconnect', () => {
      Logger.process('Manager socket disconnected')

      this.socket.disconnect()
      this.connectSocket()
    })

    this.socket.on('reconnect', () => {
      for (const shard of this.shards.values())
        this.socket.emit('status', { id: shard.id, status: shard.status })
    })

    this.socket.on('task', (task: WorkerTask) => {
      this.newTask(task)
    })

    this.socket.on('command', (cmd: WorkerCommand) => {
      this.runCommand(cmd)
    })

    this.socket.on('experiments', (experiments: Experiment[]) => {
      Experiments.updateExperiments(experiments)
    })

    this.socket.on('apievent', (event: any) => {
      FSAPI?.emitRawEvent(event, e => Logger.warn(`Unhandled FreeStuff Api Event ${e.event}`))
    })

    this.socket.on('config.global', (data: any) => {
      RemoteConfig.update(data)
    })

    this.socket.on('meta', (data: any) => {
      this.meta = data
    })
  }

  private static newTask(task: WorkerTask) {
    Logger.process(`Manager assigned task: ids[${task.ids}]`)
    this.task = task

    for (const shard of task.ids) {
      if (this.shards.has(shard)) continue

      this.shards.set(shard, {
        id: shard,
        status: 'idle'
      })
    }

    if (!this.assignmentPromise) {
      Logger.process('Reassignment to different shard id, restarting')
      process.exit(0) // TODO make properly
      // if (this.assignedShardId !== task.shardId) {
      //   Logger.process('Reassignment to different shard id, restarting')
      //   process.exit(0)
      // }
      // if (this.assignedShardCount !== task.shardCount) {
      //   Logger.process('Reassignment to different shard count, restarting')
      //   process.exit(0)
      // }
      // TODO
    } else {
      this.assignmentPromise({
        id: 'startup',
        task
      })
      this.assignmentPromise = null
    }
  }

  private static async runCommand(cmd: WorkerCommand) {
    switch (cmd.id) {
      case 'shutdown':
        Logger.manager('Shutdown.')
        process.exit(0)

      case 'reload_lang':
        Logger.manager('Reload language cache.')
        reloadLanguages()
        break

      case 'resend_to_guild':
        Logger.manager('Resend received')
        for (const guildid of cmd.guilds) {
          if (!Util.belongsToShard(Long.fromString(guildid))) continue
          const guildData = await DatabaseManager.getGuildData(guildid)
          const freebies = AnnouncementManager.getCurrentFreebies()
          MessageDistributor.sendToGuild(guildData, freebies, false, false)
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

  //

  public static getSelfUUID(): string {
    return this.selfUUID
  }

  public static getTask(): WorkerTask {
    return this.task
  }

  public static getMeta() {
    return this.meta
  }

}
