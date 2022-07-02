import * as redis from 'redis'
import { configjs } from '../types/config'


export default class Redis {

  public static client: redis.RedisClientType<any, any>
  public static localMode: boolean = false
  private static localStorage: Map<string, any>

  //

  public static init(config: configjs) {
    if (!config.redis) {
      this.localMode = true
      this.localStorage = new Map()
      return
    }

    Redis.client = redis.createClient(config.redis)
    Redis.client.on('error', (_err) => {
      // TODO(low) sentry
      // SentryManager.report(err)
    })
  }

  public static get(key: string): Promise<any> {
    if (this.localMode)
      return this.localStorage.get(key)

    return this.client?.get(key) ?? null
  }

  public static set(key: string, value: string): Promise<string> {
    if (this.localMode) {
      this.localStorage.set(key, value)
      return Promise.resolve(value)
    }

    return this.client?.set(key, value) ?? null
  }

  public static async inc(key: string, amount = 1): Promise<number> {
    if (this.localMode) {
      this.localStorage.set(key, this.localStorage.get(key) + amount)
      return Promise.resolve(this.localStorage.get(key))
    }

    if (amount === 1)
      return this.client?.incr(key) ?? null

    if (!this.client)
      return null

    const waitFor = []
    while (amount-- > 0)
      waitFor.push(this.client.incr(key))

    const out = await Promise.all(waitFor)
    return out.sort()[out.length - 1]
  }

}
