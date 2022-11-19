import { DataWebhook } from "@freestuffbot/common"
import { config } from ".."
import WebhooksApi from "../api/webhooks-api"
import { MagicNumber, MAGICNUMBER_BAD_GATEWAY } from "../lib/magic-number"
import { Directives } from "../types/lib"


export default class WebhooksData {

  public static parseRaw(raw: any): DataWebhook[] {
    if (typeof raw !== "object") return null

    return raw
      .filter(hook => hook.application_id === config.apiUser)
      .map(hook => WebhooksData.parseSingle(hook))
  }

  public static parseSingle(raw: any): DataWebhook {
    if (typeof raw !== "object") return null

    return {
      id: raw.id,
      name: raw.name,
      avatar: raw.avatar,
      token: raw.token
    }
  }

  /**
   * 
   */

  public static async findWebhooks(channel: string, directives: Directives): Promise<DataWebhook[] | MagicNumber | null> {
    // if (!directives.includes('nocache')) {
    //   const cache = WebhookCache.get(channel, directives.includes('softcache'))
    //   if (cache !== undefined) return cache
    // }

    const fresh = await WebhooksApi.fetchWebhooks(channel, directives)
    if (fresh === undefined) return MAGICNUMBER_BAD_GATEWAY

    // WebhookCache.set(channel, fresh)
    return fresh
  }

}
