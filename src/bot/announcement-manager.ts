import { Semaphore } from 'await-semaphore'
import { GameInfo } from '@freestuffbot/typings'
import { config, FSAPI } from '../index'
import FreeStuffBot from '../freestuffbot'
import Redis from '../database/redis'
import Logger from '../lib/logger'
import MessageDistributor from './message-distributor'


export default class AnnouncementManager {

  public currentlyAnnouncing = false
  private semaphore: Semaphore

  public constructor(bot: FreeStuffBot) {
    const checkInterval = config.bot.mode === 'regular' ? 60 : 5
    this.semaphore = new Semaphore(1)

    FSAPI.on('free_games', async (ids) => {
      const release = await this.semaphore.acquire()
      let pending = await Redis.getSharded('queue')

      if (pending) pending += ' ' + ids.join(' ')
      else pending = ids.join(' ')

      await Redis.setSharded('queue', pending)
      release()
    })

    bot.on('ready', () => {
      setInterval(() => this.checkQueue(), checkInterval * 1000)
    })
  }

  private async checkQueue() {
    if (this.currentlyAnnouncing) return
    const release = await this.semaphore.acquire()

    const pending = await Redis.getSharded('pending')
    if (pending) {
      release()
      this.announce(pending)
      return
    }

    const queue = await Redis.getSharded('queue')
    if (queue) {
      await Redis.setSharded('queue', '')
      release()
      this.announce(queue)
      return
    }

    release()
  }

  /** QUEUE is games that it needs to announce but hasn't started yet */
  public async setQueue(value: string) {
    const release = await this.semaphore.acquire()
    await Redis.setSharded('queue', value)
    release()
  }

  /** PENDING is games that it needs to announce but has already started */
  public async setPending(value: string) {
    const release = await this.semaphore.acquire()
    await Redis.setSharded('pending', value)
    release()
  }

  private async announce(gameids: string) {
    this.currentlyAnnouncing = true

    this.setPending(gameids)
    AnnouncementManager.updateCurrentFreebies()

    const numberIds = gameids
      .trim()
      .split(' ')
      .map(id => parseInt(id, 10))
      .filter(e => !isNaN(e))
    const gameInfos = await FSAPI.getGameDetails(numberIds, 'info')
    await MessageDistributor.distribute(Object.values(gameInfos))

    Redis.setSharded('pending', '')
    this.currentlyAnnouncing = false
  }

  //

  private static readonly TWELVE_HOURS = 1000 * 60 * 60 * 12
  private static current: GameInfo[] = []

  public static async updateCurrentFreebies() {
    Logger.excessive('Updating current freebie list')
    const ids = await FSAPI.getGameList('free')
    const data = await FSAPI.getGameDetails(ids, 'info')
    let games = Object.values(data)

    const currentTime = new Date()
    games = games
      .filter(g => g.until && g.until.getTime() > currentTime.getTime())
      .sort((a, b) => b.until.getTime() - a.until.getTime())
    games.forEach((g) => {
      if (g.until.getTime() - currentTime.getTime() < this.TWELVE_HOURS)
        (g as any)._today = true
    })

    this.current = games
  }

  public static getCurrentFreebies(): GameInfo[] {
    return this.current
  }

}
