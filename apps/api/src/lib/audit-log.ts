import axios from "axios"
import { ButtonStyle, ComponentType, MessageEmbed } from "cordo"
import { config } from ".."
import Mongo from "../database/mongo"
import LocalConst from "./local-const"


export type AuditEvent = {
  event: 'api_app_new'
    | 'api_description_update'
    | 'api_key_regen'
    | 'api_webhook_update'
    | 'api_webhook_test'
    | 'api_webhook_outgoing_failed'
  author: string
} | {
  event: 'admin_config_update'
  author: string
  name: string
} | {
  event: 'admin_experiment_delete'
  author: string
  id: string
} | {
  event: 'admin_experiment_update'
    | 'admin_experiment_create'
  author: string
  id: string
  description: string
  rules: string
} | {
  event: 'product_new'
    | 'product_refetch'
    | 'product_save_draft'
    | 'product_save_approve'
    | 'product_decline'
    | 'product_delete'
  author: string
  product: string
} | {
  event: 'admin_user_update'
    | 'admin_user_delete'
  author: string
  target: string
} | {
  event: 'translations_approve_suggestion'
   | 'translations_post_comment'
  author: string
  override: boolean
  commentId: string
}

export default class AuditLog {

  public static async record(event: AuditEvent) {
    if (!config.auditLog.destinationDiscord) return

    const [ name, icon ] = await AuditLog.getAuthor(event.author)
    const data = Object.entries(event)
      .filter(([ k ]) => (k !== 'event') && (k !== 'author'))
      .map(([ k, v ]) => `${k}: ${v}`)
      .join('\n')

    const buttons: [ string, string ][] = []

    if (event.event.startsWith('product')) 
      buttons.push([ 'View Product', `https://dashboard.freestuffbot.xyz/content/${(event as any).product}` ])

    const embed: MessageEmbed = {
      author: {
        name,
        icon_url: icon
      },
      description: `**${event.event}**\n\`\`\`${data}\`\`\``,
      color: 0x2f3136
    }

    const buttonsAsComponents = buttons.map(([ label, url ]) => ({
      type: ComponentType.BUTTON,
      style: ButtonStyle.LINK,
      label,
      url
    }))

    const components = !buttons.length
      ? undefined
      : [ {
        type: ComponentType.ROW,
        components: buttonsAsComponents
        } ]

    const embeds = [ embed ]

    await axios.post(
      config.auditLog.destinationDiscord,
      { embeds, components },
      { validateStatus: null }
    ).catch(() => ({} as any))
  }

  //

  private static authorCacheData: Map<string, [ string, string ]> = new Map()
  private static authorCacheAge: Map<string, number> = new Map()
  private static readonly AVATAR_CACHE_MAX_AGE = 60 * 60 * 1000

  public static async getAuthor(userId: string): Promise<[ string, string ]> {
    if (userId === LocalConst.PSEUDO_USER_SYSTEM_ID)
      return [ 'System', 'https://media.discordapp.net/attachments/672907465670787083/999027825493418166/0.png' ]
    if (userId === LocalConst.PSEUDO_USER_UNKNOWN_ID)
      return [ 'Unknown', 'https://media.discordapp.net/attachments/672907465670787083/999028087465459812/0.png' ]

    if (this.authorCacheData.has(userId) && this.authorCacheAge.get(userId) < Date.now() + this.AVATAR_CACHE_MAX_AGE)
      return this.authorCacheData.get(userId)

    const obj = await Mongo.User
      .findById(userId)
      .lean()
      .exec()

    const avatar = `https://cdn.discordapp.com/avatars/${userId}/${obj.data.avatar}.png?size=512`
    const out: [ string, string ] = [ obj.display, avatar ]
    this.authorCacheData.set(userId, out)
    this.authorCacheAge.set(userId, Date.now())
    return out
  }

}
