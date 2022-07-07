import { CustomPermissions, DataChannel, DataWebhook, Errors, Fragile } from "@freestuffbot/common"
import DiscordGateway from "../services/discord-gateway"


export default class Webhooks {

  public static async updateWebhook(channel: DataChannel): Promise<Fragile<DataWebhook>> {
    const permissions = CustomPermissions.parseChannel(channel.permissions)
    if (!permissions.manageWebhooks) {
      return Errors.throw({
        status: Errors.STATUS_MISPERM_WEBHOOKS,
        name: 'missing permisisons',
        source: 'webhooks::updatewebhook'
      })
    }

    // try to find an existing webhook
    let [ err, hook ] = await Webhooks.findWebhook(channel)
    if (err) return Errors.throw(err)
    if (hook) return Errors.success(hook)

    // none found. create a new one
    ; [ err, hook ] = await Webhooks.createWebhook(channel)
    if (err) return Errors.throw(err)
    if (hook) return Errors.success(hook)

    // ?!???!? ?
    return Errors.throw({
      status: Errors.STATUS_INTERNAL,
      name: 'internal server error',
      source: 'webhook::updatewebhook'
    })
  }

  public static async findWebhook(channel: DataChannel): Promise<Fragile<DataWebhook | null>> {
    const [ err, hooks ] = await DiscordGateway.getWebhooks(channel.id)
    if (err) return Errors.throw(err)

    if (!hooks.length) return Errors.success(null)

    return Errors.success(hooks[0])
  }

  public static async createWebhook(channel: DataChannel): Promise<Fragile<DataWebhook>> {
    const res = await DiscordGateway.createWebhook(channel.id)
    if (!res[0]) DiscordGateway.webhooksCache.remove(channel.id)
    return res
  }

}
