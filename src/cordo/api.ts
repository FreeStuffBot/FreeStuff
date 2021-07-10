import axios from 'axios'
import { config } from '../index'
import { GuildData } from '../types/datastructs'
import Cordo from './cordo'
import { InteractionApplicationCommandCallbackData } from './types/custom'
import { GenericInteraction } from './types/ibase'
import { InteractionCallbackType } from './types/iconst'

export default class API {

  public static interactionCallback(i: GenericInteraction, type: number, data?: InteractionApplicationCommandCallbackData, guild?: GuildData) {
    API.normaliseData(data, guild)

    if (!i._answered) {
      i._answered = true
      axios.post(`https://discord.com/api/v8/interactions/${i.id}/${i.token}/callback`, { type, data })
      return
    }

    switch (type) {
      case InteractionCallbackType.PONG: break
      case InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE: break
      case InteractionCallbackType.DEFERRED_UPDATE_MESSAGE: break
      case InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE:
        axios.post(`https://discord.com/api/v8/webhooks/${config.bot.clientid}/${i.token}`, data)
        break
      case InteractionCallbackType.UPDATE_MESSAGE:
        axios.patch(`https://discord.com/api/v8/webhooks/${config.bot.clientid}/${i.token}/messages/@original`, data)
        break
    }
  }

  /**
   * Transforms the shorthand way of writing into proper discord api compatible objects
   */
  private static normaliseData(data?: InteractionApplicationCommandCallbackData, guild?: GuildData) {
    if (!data) return
    // explicitly not using this. in this function due to unwanted side-effects in lambda functions
    Cordo.middlewares.interactionCallback.forEach(f => f(data, guild))

    // explicit lose typecheck (== instead of ===) to catch both null and undefined
    if (data.content == null)
      data.content = ''

    if (data.description || data.title) {
      if (!data.embeds) data.embeds = []
      data.embeds.push({
        title: data.title || undefined,
        description: data.description || undefined,
        footer: data.footer ? { text: data.footer } : undefined,
        thumbnail: data.image ? { url: data.image } : undefined,
        color: data.color || 0x2F3136
      })
      data.description = undefined
      data.title = undefined
    }
  }

}
