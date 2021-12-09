import { Counter, Gauge, Registry } from 'prom-client'
import { Request, Response } from 'express'
import { Core } from '..'


export default class Metrics {

  private static register = new Registry()

  public static counterGatewayEvents = new Counter({
    name: 'fsb_gateway_events',
    help: 'Keeps track of the total amount of incoming gateway events',
    labelNames: [ 'type' ]
  })

  public static counterInteractions = new Counter({
    name: 'fsb_interactions',
    help: 'Keeps track of the total amount of interactions',
    labelNames: [ 'type', 'name' ]
  })

  public static counterOutgoing = new Counter({
    name: 'fsb_outgoing',
    help: 'Keeps track of the total amount of announcement messages sent',
    labelNames: [ 'status' ]
  })

  public static counterApiResponses = new Counter({
    name: 'fsb_api_responses',
    help: 'Keep track of discord api responses',
    labelNames: [ 'status' ]
  })

  public static gaugeGatewayPing = new Gauge({
    name: 'fsb_gateway_ping',
    help: 'Shows the current gateway ping. Updated every 10 seconds.'
  })

  public static gaugeGuildCacheSize = new Gauge({
    name: 'fsb_caches_guilds_size',
    help: 'Amount of guilds currently cached on this worker. Updated every 10 seconds.'
  })

  public static gaugeUserCacheSize = new Gauge({
    name: 'fsb_caches_users_size',
    help: 'Amount of users currently cached on this worker. Updated every 10 seconds.'
  })

  public static gaugeChannelCacheSize = new Gauge({
    name: 'fsb_caches_channels_size',
    help: 'Amount of channels currently cached on this worker. Updated every 10 seconds.'
  })

  // public static gaugeCordoAIRC = new Gauge({
  //   name: 'fsb_cordo_airc',
  //   help: 'Amount of Active Interaction Reply Contexts (Cordo). Updated every 10 seconds.'
  // })

  //

  public static init() {
    Metrics.registerMetrics()
    Metrics.startCollectors()
  }

  private static registerMetrics() {
    // collectDefaultMetrics({ register: Metrics.register })

    Metrics.register.registerMetric(Metrics.counterGatewayEvents)
    Metrics.register.registerMetric(Metrics.counterInteractions)
    Metrics.register.registerMetric(Metrics.counterOutgoing)
    Metrics.register.registerMetric(Metrics.counterApiResponses)

    Metrics.register.registerMetric(Metrics.gaugeGatewayPing)
    Metrics.register.registerMetric(Metrics.gaugeGuildCacheSize)
    Metrics.register.registerMetric(Metrics.gaugeUserCacheSize)
    Metrics.register.registerMetric(Metrics.gaugeChannelCacheSize)
    // Metrics.register.registerMetric(Metrics.gaugeCordoAIRC)
  }

  private static startCollectors() {
    setInterval(() => {
      const ping = Core?.ws?.ping ?? -1
      Metrics.gaugeGatewayPing.set(ping)

      const guilds = Core?.guilds?.cache?.size ?? 0
      Metrics.gaugeGuildCacheSize.set(guilds)

      const users = Core?.users?.cache?.size ?? 0
      Metrics.gaugeUserCacheSize.set(users)

      const channels = Core?.channels?.cache?.size ?? 0
      Metrics.gaugeChannelCacheSize.set(channels)

      // const activeInteractionReplyContexts = CordoReplies.activeInteractionReplyContexts.length
      // Metrics.gaugeCordoAIRC.set(activeInteractionReplyContexts)
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
