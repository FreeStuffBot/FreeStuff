import { CronJob } from 'cron'
import { Core } from '../index'
import FreeStuffBot from '../freestuffbot'
import Logger from '../lib/logger'
import DatabaseManager from '../bot/database-manager'
import Manager from '../controller/manager'
import Database, { FreeStuffCollection } from './database'


export class DbStats {

  public static startMonitoring(bot: FreeStuffBot) {
    new CronJob('0 0 0 * * *', () => {
      setTimeout(async () => {
        const guildCount = bot.guilds.cache.size
        const guildMemberCount = [ ...bot.guilds.cache.values() ].reduce((count, g) => count + g.memberCount, 0)

        Logger.process(`Updated Stats. Guilds: ${bot.guilds.cache.size}; Members: ${guildMemberCount}; Shards ${bot.options.shards}`)
        ;(await this.usage).guilds.updateYesterday(guildCount, true)
        ;(await this.usage).members.updateYesterday(guildMemberCount, true)

        this.updateTopClients()
      }, 60000)
    }).start()

    bot.on('ready', this.updateTopClients)
  }

  public static get usage(): Promise<DbStatUsage> {
    return new DbStatUsage().load()
  }

  public static async updateTopClients() {
    const top = Core.guilds.cache.sort((a, b) => b.memberCount - a.memberCount).values()
    const top20 = Array.from(top).splice(0, 20)
    const out = top20.map(async g => ({
      id: g.id,
      name: g.name,
      size: g.memberCount,
      icon: g.iconURL(),
      features: g.features,
      setup: !!((await DatabaseManager.getGuildData(g.id))?.channel)
    }))

    await Promise.all(out).then((out) => {
      Database
        .collection('stats-top-clients')
        ?.findOneAndUpdate(
          { _id: Manager.getMeta().workerIndex || 0 },
          { $set: { value: out } },
          { upsert: true }
        )
    })
  }

}

export class DbStatUsage {

  public readonly raw: { [key: string]: number[] } = {}

  //

  async load(): Promise<this> {
    const c = await Database
      .collection('stats-usage')
      ?.find({})
      .toArray()
    for (const temp of c)
      this.raw[temp._id] = temp.value
    return this
  }

  get guilds(): DbStatGraph {
    return new DbStatGraph('stats-usage', { _id: 'guilds' }, this.raw.guilds || [], this.raw)
  }

  get members(): DbStatGraph {
    return new DbStatGraph('stats-usage', { _id: 'members' }, this.raw.members || [], this.raw)
  }

  get announcements(): DbStatGraph {
    return new DbStatGraph('stats-usage', { _id: 'announcements' }, this.raw.announcements || [], this.raw)
  }

  get reconnects(): DbStatGraph {
    return new DbStatGraph('stats-usage', { _id: 'reconnects' }, this.raw.reconnects || [], this.raw)
  }

}

export class DbStatGraph {

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    private _collectionname: string,
    private _dbquery: any,
    public readonly raw: number[],
    private _fullraw: any
  ) { }

  //

  public get today(): number {
    if (!this.raw) return 0
    return this.raw[getDayId()] || 0
  }

  public update(dayId: number, value: number, delta: boolean): any {
    if (dayId < 0) return
    if (this.raw) {
      let obj = {} as any
      obj[`value.${dayId}`] = value
      if (delta) obj = { $inc: obj }
      else obj = { $set: obj }
      if (dayId > this.raw.length) {
        if (!obj.$set)
          obj.$set = {}
        while (dayId-- > this.raw.length)
          obj.$set[`value.${dayId}`] = 0
      }
      return Database
        .collection(this._collectionname as FreeStuffCollection)
        ?.updateOne(this._dbquery, obj)
    } else {
      const parentExists = Object.keys(this._fullraw).length > 0
      const obj = parentExists ? {} : this._dbquery
      obj.value = []
      for (let i = 0; i < dayId; i++)
        obj.value.push(0)
      obj.value.push(value)
      if (parentExists) {
        return Database
          .collection(this._collectionname as FreeStuffCollection)
          ?.updateOne(this._dbquery, { $set: obj })
      } else {
        this._fullraw.value = obj
        return Database
          .collection(this._collectionname as FreeStuffCollection)
          ?.insertOne(obj)
      }
    }
  }

  public updateToday(value: number, delta: boolean = true) {
    this.update(getDayId(), value, delta)
  }

  public updateYesterday(value: number, delta: boolean = true) {
    this.update(getDayId() - 1, value, delta)
  }

}

function getDayId(): number {
  const now = new Date()
  const start = new Date(2020, 0, 0)
  const diff = now.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  const day = Math.floor(diff / oneDay)
  return day - 1 // index 0 on 1st january
}
