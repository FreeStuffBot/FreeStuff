import * as redis from 'redis'
import SentryManager from '../thirdparty/sentry/sentry'
import { config } from '../index'
import Logger from '../lib/logger'
import Manager from '../controller/manager'


export default class Redis {

  public static client: redis.RedisClient
  public static localMode: boolean = false
  private static localStorage: Map<string, any>

  //

  public static init() {
    if (!config.redis) {
      this.localMode = true
      this.localStorage = new Map()
      return
    }

    Redis.client = redis.createClient(config.redis)
    Redis.client.on('error', (err) => {
      Logger.error(err)
      SentryManager.report(err)
    })
  }

  public static get(key: string): Promise<any> {
    if (this.localMode) return this.localStorage.get(key)
    if (!this.client) return null
    return new Promise(res => this.client.get(key, (_, data) => res(data)))
  }

  public static getSharded(key: string): Promise<any> {
    return this.get(`w${Manager.getMeta().workerIndex}_${key}`)
  }

  public static set(key: string, value: string): Promise<string> {
    if (this.localMode) {
      this.localStorage.set(key, value)
      return Promise.resolve(value)
    }

    return new Promise((res) => {
      this.client.set(key, value, (_, _data) => res(value))
    })
  }

  public static setSharded(key: string, value: string): Promise<string> {
    return this.set(`w${Manager.getMeta().workerIndex}_${key}`, value)
  }

  public static async inc(key: string, amount = 1): Promise<number> {
    if (this.localMode) {
      this.localStorage.set(key, this.localStorage.get(key) + amount)
      return Promise.resolve(this.localStorage.get(key))
    }

    if (amount === 1) {
      return new Promise((res) => {
        this.client.incr(key, (_, data) => res(data))
      })
    }

    const waitFor = []
    while (amount-- > 0)
      waitFor.push(new Promise(res => this.client.incr(key, (_, data) => res(data))))
    const out = await Promise.all(waitFor)
    return out.sort()[out.length - 1]
  }

  public static incSharded(key: string, amount = 1): Promise<number> {
    return this.inc(`w${Manager.getMeta().workerIndex}_${key}`, amount)
  }

}
