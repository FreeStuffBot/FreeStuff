import { DataWebhook } from "@freestuffbot/common"
import { config } from ".."
import WebhooksData from "../data/webhooks-data"
import { MagicNumber, MAGICNUMBER_MAX_WEBHOOKS_REACHED, MAGICNUMBER_MISSING_PERMISSIONS } from "../lib/magic-number"
import Metrics from "../lib/metrics"
import { Directives } from "../types/lib"
import RestGateway from "./rest-gateway"


export default class WebhooksApi {

  public static async fetchWebhooks(channel: string, directives: Directives, retry = true): Promise<DataWebhook[] | null | MagicNumber> {
    const res = await RestGateway.queue({
      method: 'GET',
      bucket: channel,
      endpoint: `/channels/${channel}/webhooks`,
      noCache: !directives.nocache,
      softCache: !directives.softcache
    })

    Metrics.counterDgRequests.inc({ method: 'GET', endpoint: 'webhooks', status: res.status })

    if (res.status === 403)
      return MAGICNUMBER_MISSING_PERMISSIONS

    if (res.status >= 400 && res.status < 500)
      return null

    if (res.status >= 200 && res.status < 300)
      return WebhooksData.parseRaw(res.data)

    if (retry)
      return await this.fetchWebhooks(channel, directives, false)

    return undefined
  }

  public static async fetchWebhook(accessor: string, directives: Directives, retry = true): Promise<DataWebhook[] | null | MagicNumber> {
    const res = await RestGateway.queue({
      method: 'GET',
      bucket: accessor,
      endpoint: `/webhooks/${accessor}`,
      noCache: !directives.nocache,
      softCache: !directives.softcache
    })

    Metrics.counterDgRequests.inc({ method: 'GET', endpoint: 'webhook', status: res.status })

    if (res.status === 403)
      return MAGICNUMBER_MISSING_PERMISSIONS

    if (res.status >= 400 && res.status < 500)
      return null

    if (res.status >= 200 && res.status < 300)
      return directives.nodata ? {} : res.data

    if (retry)
      return await this.fetchWebhook(accessor, directives, false)

    return undefined
  }

  public static async createWebhook(channel: string, retry = true): Promise<DataWebhook | null | MagicNumber> {
    const payload = {
      name: config.webhookDefaultName,
      avatar: config.webhookDefaultAvatar ?? undefined
    }

    const res = await RestGateway.queue({
      method: 'POST',
      bucket: channel,
      endpoint: `/channels/${channel}/webhooks`,
      payload
    })

    Metrics.counterDgRequests.inc({ method: 'POST', endpoint: 'webhooks', status: res.status })

    if (res.status === 403)
      return MAGICNUMBER_MISSING_PERMISSIONS

    if (res.status === 400 && res.data?.code === 30007)
      return MAGICNUMBER_MAX_WEBHOOKS_REACHED

    if (res.status >= 400 && res.status < 500)
      return null

    if (res.status >= 200 && res.status < 300)
      return WebhooksData.parseSingle(res.data)

    if (retry)
      return await this.createWebhook(channel, false)

    return undefined
  }

}
