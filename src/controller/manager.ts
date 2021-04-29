import { hostname } from 'os'
import { io, Socket } from 'socket.io-client'
import { config } from '../index'
import Logger from '../util/logger'
import { ManagerCommand, ShardStatus, ShardTask } from '../types/controller'
import { getGitCommit } from '../util/git-parser'


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

  public static ready(): Promise<ManagerCommand> {
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
      query: {
        type: 'shard',
        client: 'discord',
        mode: config.bot.mode,
        version: gitCommit.hash,
        server: hostname()
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
    })

    this.socket.on('disconnect', () => {
      Logger.process('Manager socket disconnected')
    })

    this.socket.on('task', (task: ShardTask) => {
      this.newTask(task)
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

}
