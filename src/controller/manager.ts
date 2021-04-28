import { Manager as SocketManager, Socket } from 'socket.io-client'
import { config } from '../index'
import Logger from '../util/logger'
import { ManagerCommand } from '../types/controller'
import { getGitCommit } from '../util/git-parser'


/**
 * The Manager decides how to start and operate the bot.
 */
export default class Manager {

  private static readonly DEFAULT_SOCKET_HOST = 'wss://management.freestuffbot.xyz'
  private static readonly DEFAULT_SOCKET_PATH = '/api/internal/socket'

  private static started = false
  private static socketManager: SocketManager = null
  private static socket: Socket = null

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
      return new Promise((_res) => {})
    }

    return Promise.resolve({ id: 'shutdown' })
  }

  private static async openSocket() {
    if (config.mode.name !== 'discovery') return // for type safety below

    const socketHost = config.mode.master.host || this.DEFAULT_SOCKET_HOST
    const socketPath = config.mode.master.path || this.DEFAULT_SOCKET_PATH
    const gitCommit = await getGitCommit()
    this.socketManager = new SocketManager(socketHost, {
      reconnectionDelayMax: 10000,
      query: {
        client: 'discord',
        mode: config.bot.mode,
        version: gitCommit.shortHash
      },
      autoConnect: false,
      path: socketPath,
      jsonp: false,
      transports: [ 'websocket' ]
    })

    this.socket = this.socketManager.socket(socketPath, {
      auth: {
        token: config.mode.master.auth || config.apisettings.key
      }
    })

    this.prepareSocket()

    Logger.process('Connecting to manager socket...')
    this.socket.connect()
  }

  private static prepareSocket() {
    this.socket.on('open', () => {
      Logger.process('Manager socket connected')
    })
  }

}
