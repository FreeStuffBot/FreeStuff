import axios from 'axios'
import Logger from '../lib/logger'
import { config } from '../index'
import PermissionStrings from '../lib/permission-strings'
import RemoteConfig from '../controller/remote-config'
import Cordo from './cordo'
import { InteractionApplicationCommandCallbackData } from './types/custom'
import { GenericInteraction, InteractionLocationGuild } from './types/ibase'
import { MessageComponent } from './types/icomponent'
import { ComponentType, InteractionCallbackType, InteractionComponentFlag } from './types/iconst'

export default class CordoAPI {

  public static interactionCallback(i: GenericInteraction, type: number, data?: InteractionApplicationCommandCallbackData) {
    CordoAPI.normaliseData(data, i)

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
  private static normaliseData(data: InteractionApplicationCommandCallbackData, i: GenericInteraction) {
    if (!data) return
    // explicitly not using this. in this function due to unwanted side-effects in lambda functions
    Cordo._data.middlewares.interactionCallback.forEach(f => f(data, i.guildData))

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

    if (data.components?.length && (data.components[0].type as any) !== ComponentType.ROW) {
      const rows: MessageComponent[][] = []
      let newlineFlag = true
      for (const comp of data.components) {
        if (comp.type !== ComponentType.LINE_BREAK && comp.flags?.length && !!(comp as any).custom_id) {
          (comp as any).custom_id += `-${comp.flags.join('')}`
          if (!!(i as InteractionLocationGuild).member && !comp.flags.includes(InteractionComponentFlag.ACCESS_EVERYONE)) {
            const perms = BigInt((i as InteractionLocationGuild).member.permissions)
            if (comp.flags.includes(InteractionComponentFlag.ACCESS_ADMIN) && !PermissionStrings.containsAdmin(perms)) {
              if (comp.flags.includes(InteractionComponentFlag.HIDE_IF_NOT_ALLOWED)) comp.type = null
              else comp.disabled = true
            } else if (comp.flags.includes(InteractionComponentFlag.ACCESS_MANAGE_SERVER) && !PermissionStrings.containsManageServer(perms)) {
              if (comp.flags.includes(InteractionComponentFlag.HIDE_IF_NOT_ALLOWED)) comp.type = null
              else comp.disabled = true
            } else if (comp.flags.includes(InteractionComponentFlag.ACCESS_MANAGE_MESSAGES) && !PermissionStrings.containsManageMessages(perms)) {
              if (comp.flags.includes(InteractionComponentFlag.HIDE_IF_NOT_ALLOWED)) comp.type = null
              else comp.disabled = true
            } else if (comp.flags.includes(InteractionComponentFlag.ACCESS_BOT_ADMIN) && !RemoteConfig.botAdmins.includes(i.user?.id || i.member.user.id)) {
              if (comp.flags.includes(InteractionComponentFlag.HIDE_IF_NOT_ALLOWED)) comp.type = null
              else comp.disabled = true
            }
          }
          delete comp.flags
        }

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
