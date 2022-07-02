import { SanitizedProductType } from "@freestuffbot/common"


type EventWithNoData = 'platform_scrape_auto'
type EventWithProduct = 'product_found'
type EventWithUser = 'api_app_new' | 'api_descr_update' | 'api_key_regen' | 'api_webhook_update' | 'api_webhook_test' | 'admin_global_config_update' | 'api_webhook_outgoing_failed'
type EventWithUserAndId = 'admin_experiment_create' | 'admin_experiment_delete'
type EventWithUserAndIdAndValue = 'admin_experiment_update'
type EventWithUserAndProductId = 'product_new_scratch' | 'product_save_draft' | 'product_accept' | 'product_decline' | 'product_delete'
type EventWithUserAndProductIdAndUrl = 'new_url'
type EventWithUserAndPlatformId = 'platform_scrape_manual'
type EventWithUserAndLanguage = 'translation_submit'
type EventWithUserAndTargetUser = 'admin_user_update' | 'admin_user_delete'
export type Event = EventWithNoData | EventWithUser | EventWithUserAndId | EventWithUserAndIdAndValue | EventWithUserAndProductId | EventWithUserAndPlatformId | EventWithUserAndProductIdAndUrl | EventWithProduct | EventWithUserAndTargetUser | EventWithUserAndLanguage


/* eslint-disable no-dupe-class-members */
export default class Notifier {

  public static newEvent(event: EventWithUser, data: { user: string }): any
  public static newEvent(event: EventWithUserAndId, data: { user: string, id: string }): any
  public static newEvent(event: EventWithUserAndIdAndValue, data: { user: string, id: string, value: string }): any
  public static newEvent(event: EventWithUserAndProductId, data: { user: string, product: number }): any
  public static newEvent(event: EventWithUserAndPlatformId, data: { user: string, platform: string }): any
  public static newEvent(event: EventWithUserAndProductIdAndUrl, data: { user: string, product: number, url: string }): any
  public static newEvent(event: EventWithUserAndLanguage, data: { user: string, language: string, count: number }): any
  public static newEvent(event: EventWithUserAndTargetUser, data: { user: string, target: string }): any
  public static newEvent(event: EventWithProduct, data: { product: SanitizedProductType }): any
  public static newEvent(event: EventWithNoData): any
  public static newEvent(event: Event, data?: any): any {

    // TODO(lowest) database audit log
    this.sendDiscordWebhook(event, data)
  }

  private static sendDiscordWebhook(_event: Event, _data: any) {
    // if (!config.infra.auditLog?.discordWebhook) return

    // const embed = {
    //   author: { name: event },
    //   description: Object
    //     .keys(data)
    //     .map(k => `${k}: ${
    //       (k === 'user' || k === 'target')
    //         ? (data[k] === '0' || data[k] === '-1')
    //           ? '{system}'
    //           : `<@${data[k]}>`
    //         : (k === 'game')
    //           ? `[${data[k]}](https://dashboard.freestuffbot.xyz/content/${data[k]})`
    //           : data[k]
    //     }`)
    //     .join('\n')
    // }

    // axios.post(config.infra.auditLog.discordWebhook, {
    //   embeds: [ embed ]
    // }).catch(() => { })
  }

}
