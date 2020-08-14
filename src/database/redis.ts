import * as redis from 'redis';
import SentryManager from '../thirdparty/sentry/sentry';
import { Core, config } from '../index';


export type dbcollection = 'guilds' | 'stats-usage' | 'games';

export default class Redis {

  public static client: redis.RedisClient;

  //

  public constructor() { }

  //

  public static init() {
    Redis.client = redis.createClient(config.redis);
    Redis.client.on('error', err => {
      console.error(err);
      SentryManager.report(err);
    });
  }

  public static async get(key: string): Promise<any> {
    if (!this.client) return null;
    return new Promise(res => this.client.get(key, (err, data) => res(data)));
  }

  public static async getSharded(key: string): Promise<any> {
    return this.get(`s${Core.options.shardId}_${key}`);
  }

  public static set(key: string, value: string): void {
    this.client.set(key, value);
  }

  public static setSharded(key: string, value: string): void {
    this.set(`s${Core.options.shardId}_${key}`, value);
  }

  public static inc(key: string): void {
    this.client.incr(key);
  }

  public static incSharded(key: string): void {
    this.inc(`s${Core.shard}_${key}`);
  }

}