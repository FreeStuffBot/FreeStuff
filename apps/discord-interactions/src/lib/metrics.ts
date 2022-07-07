import { Counter, Gauge, Registry } from 'prom-client'
import { Request, Response } from 'express'
import DatabaseGateway from '../services/database-gateway'


export default class Metrics {

  private static register = new Registry()

  public static counterInteractions = new Counter({
    name: 'fsb_sdi_interactions',
    help: 'FreeStuffBot Service DiscordInteractions: incoming interactions',
    labelNames: [ 'type', 'name' ]
  })

  public static counterDiDbReads = new Counter({
    name: 'fsb_sdi_db_reads',
    help: 'FreeStuffBot Service DiscordInteractions: DataBase Reads',
    labelNames: [ 'collection', 'success' ]
  })

  public static counterDiDbWrites = new Counter({
    name: 'fsb_sdi_db_writes',
    help: 'FreeStuffBot Service DiscordInteractions: DataBase Writes',
    labelNames: [ 'collection', 'success' ]
  })

  public static counterDiErrors = new Counter({
    name: 'fsb_sdi_errors',
    help: 'FreeStuffBot Service DiscordInteractions: Errors',
    labelNames: [ 'errorid', 'source' ]
  })

  public static gaugeDiGuildCacheSize = new Gauge({
    name: 'fsb_sdi_guild_cache_size',
    help: 'Amount of channels currently cached on this worker. Updated every 10 seconds.',
    labelNames: [ 'bucket' ]
  })

  //

  public static init() {
    Metrics.registerMetrics()
    Metrics.startCollectors()
  }

  private static registerMetrics() {
    // collectDefaultMetrics({ register: Metrics.register })

    Metrics.register.registerMetric(Metrics.counterInteractions)
    Metrics.register.registerMetric(Metrics.counterDiDbReads)
    Metrics.register.registerMetric(Metrics.counterDiDbWrites)
    Metrics.register.registerMetric(Metrics.counterDiErrors)

    Metrics.register.registerMetric(Metrics.gaugeDiGuildCacheSize)
  }

  private static startCollectors() {
    setInterval(() => {
      const guilds = DatabaseGateway.cacheSizes
      Metrics.gaugeDiGuildCacheSize.set({ bucket: 'active' }, guilds[0])
      Metrics.gaugeDiGuildCacheSize.set({ bucket: 'passive' }, guilds[1])
    }, 10e3)
  }

  //

  public static endpoint() {
    return async function (_req: Request, res: Response) {
      res
        .status(200)
        .header({ 'Content-Type': 'text/plain' })
        .send(await Metrics.register.metrics())
    }
  }

}
