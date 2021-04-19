import * as redis from 'redis'
import SentryManager from '../thirdparty/sentry/sentry'
import { Core, config } from '../index'


export type dbcollection = 'guilds' | 'stats-usage' | 'games';

export default class Redis {

  public static client: redis.RedisClient;

  //

  public static init() {
    Redis.client = redis.createClient(config.redis)
    Redis.client.on('error', (err) => {
      console.error(err)
      SentryManager.report(err)
    })
  }

  public static get(key: string): Promise<any> {
    if (!this.client) return null
    return new Promise(res => this.client.get(key, (_, data) => res(data)))
  }

  public static getSharded(key: string): Promise<any> {
    return this.get(`s${Core.options.shards[0]}_${key}`)
  }

  public static set(key: string, value: string): Promise<string> {
    return new Promise(res => this.client.set(key, value, (_, _data) => res(value)))
  }

  public static setSharded(key: string, value: string): Promise<string> {
    return this.set(`s${Core.options.shards[0]}_${key}`, value)
  }

  public static async inc(key: string, amount = 1): Promise<number> {
    if (amount === 1) {
      return new Promise(res => this.client.incr(key, (_, data) => res(data)))
    } else {
      const waitFor = []
      while (amount-- > 0)
        waitFor.push(new Promise(res => this.client.incr(key, (_, data) => res(data))))
      const out = await Promise.all(waitFor)
      return out.sort().reverse()[0]
    }
  }

  public static incSharded(key: string, amount = 1): Promise<number> {
    return this.inc(`s${Core.options.shards[0]}_${key}`, amount)
  }

}
