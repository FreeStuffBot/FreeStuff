import axios from 'axios'
import Logger from '../lib/logger'
import { config } from '../index'
import { GuildData } from '../types/datastructs'
import Cordo from './cordo'
import { InteractionApplicationCommandCallbackData } from './types/custom'
import { GenericInteraction } from './types/ibase'
import { MessageComponent } from './types/icomponent'
import { ComponentType, InteractionCallbackType } from './types/iconst'

export default class CordoAPI {

  public static interactionCallback(i: GenericInteraction, type: number, data?: InteractionApplicationCommandCallbackData, guild?: GuildData) {
    CordoAPI.normaliseData(data, guild)

    if (!i._answered) {
      i._answered = true
      axios
        .post(`https://discord.com/api/v8/interactions/${i.id}/${i.token}/callback`, { type, data }, { validateStatus: null })
        .then((res) => {
          if (res.status >= 300) {
            Logger.warn('Interaction callback failed with error:')
            Logger.warn(JSON.stringify(res.data, null, 2))
            Logger.warn('Request payload:')
            Logger.warn(JSON.stringify({ type, data }, null, 2))
          }
        })
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
    Cordo._data.middlewares.interactionCallback.forEach(f => f(data, guild))

    if (!data.content)
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
      delete data.description
      delete data.title
    }

    if (data.components && data.components.length && (data.components[0].type as any) !== ComponentType.ROW) {
      const rows: MessageComponent[][] = []
      let newlineFlag = true
      for (const comp of data.components) {
        switch (comp.type) {
          case ComponentType.LINE_BREAK: {
            if (rows[rows.length - 1].length)
              newlineFlag = true
            break
          }
          case ComponentType.BUTTON: {
            if (newlineFlag) rows.push([])
            newlineFlag = false

            if (comp.label?.length > 25)
              comp.label = comp.label.substr(0, 25)

            rows[rows.length - 1].push(comp)

            if (rows[rows.length - 1].length >= 5)
              newlineFlag = true
            break
          }
          case ComponentType.SELECT: {
            if (comp.options?.length > 25)
              comp.options.length = 25

            rows.push([ comp ])
            newlineFlag = true
          }
        }
      }
      data.components = rows.map(c => ({ type: ComponentType.ROW, components: c })) as any
    }
  }

}
