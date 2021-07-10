import * as fs from 'fs'
import * as path from 'path'
import Logger from 'lib/logger'
import { Core } from '../index'
import { InteractionCommandHandler, InteractionComponentHandler, InteractionReplyContext } from './types/custom'
import { InteractionCallbackType, InteractionResponseFlags, InteractionType } from './types/iconst'
import { InteractionCallbackMiddleware } from './types/middleware'
import API from './api'

export default class Cordo {

  private static commandHandlers: { [command: string]: InteractionCommandHandler } = {}
  private static componentHandlers: { [command: string]: InteractionComponentHandler } = {}

  /* TODO @metrics */
  private static activeInteractionReplyContexts: InteractionReplyContext[] = []

  public static middlewares = {
    interactionCallback: [] as InteractionCallbackMiddleware[]
  }

  //

  public static registerCommandHandler(command: string, handler: InteractionCommandHandler) {
    if (Cordo.commandHandlers[command])
      Logger.warn(`Command handler for ${command} got assigned twice. Overriding.`)
    Cordo.commandHandlers[command] = handler
  }

  public static registerComponentHandler(id: string, handler: InteractionComponentHandler) {
    if (Cordo.componentHandlers[id])
      Logger.warn(`Component handler for ${id} got assigned twice. Overriding.`)
    Cordo.componentHandlers[id] = handler
  }

  public static findCommandHandlers(dir: string | string[], prefix?: string) {
    if (typeof dir !== 'string') dir = path.join(...dir)
    for (const file of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, file)
      const fullName = (prefix ? prefix + '_' : '') + file.split('.')[0]

      if (file.includes('.')) {
        if (!file.endsWith('.js')) continue
        Cordo.registerCommandHandler(fullName, require(fullPath).default)
      } else {
        Cordo.findCommandHandlers(fullPath, fullName)
      }
    }
  }

  public static findComponentHandlers(dir: string | string[], prefix?: string) {
    if (typeof dir !== 'string') dir = path.join(...dir)
    for (const file of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, file)
      const fullName = (prefix ? prefix + '_' : '') + file.split('.')[0]

      if (file.includes('.')) {
        if (!file.endsWith('.js')) continue
        Cordo.registerComponentHandler(fullName, require(fullPath).default)
      } else {
        Cordo.findComponentHandlers(fullPath, fullName)
      }
    }
  }

  //

  public static registerMiddlewareForInteractionCallback(fun: InteractionCallbackMiddleware) {
    Cordo.middlewares.interactionCallback.push(fun)
  }

  //

  public static emitInteraction(i: GenericInteraction) {
    // for (const option of i.options || [])
    //   i.option[option.name] = option.value

    if (i.type === InteractionType.COMMAND)
      Cordo.onCommand(i)
    else if (i.type === InteractionType.COMPONENT)
      Cordo.onComponent(i)
    else
      Logger.warn(`Unknown interaction type ${(i as any).type}`)
  }

  private static async onCommand(i: CommandInteraction) {
    if (!Cordo.commandHandlers[i.data.name]) {
      Logger.warn(`Unhandled command "${i.data.name}"`)
      API.interactionCallback(i, InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE)
      return
    }

    try {
      const data = i.guild_id
        ? await Core.databaseManager.getGuildData(i.guild_id)
        : undefined

        Cordo.commandHandlers[i.data.name](Cordo.buildReplyableCommandInteraction(i), data)
    } catch (ex) {
      Logger.warn(ex)
      try {
        API.interactionCallback(i, InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE, {
          content: 'We are very sorry but an error occured while processing your command. Please try again.',
          flags: InteractionResponseFlags.EPHEMERAL
        })
      } catch (ex) {
        Logger.warn(ex)
      }
    }
  }

  private static onComponent(i: ComponentInteraction) {
    const context: InteractionReplyContext | undefined = Cordo.activeInteractionReplyContexts.find(c => c.id === i.message.interaction?.id)
    if (context?.resetTimeoutOnInteraction) {
      clearTimeout(context.timeoutRunner)
      setTimeout(context.timeoutRunFunc, context.timeout)
    }

    if (context?.handlers[i.data.custom_id]) {
      context.handlers[i.data.custom_id](Cordo.buildReplyableComponentInteraction(i), null /* TODO */)
    } else if (Cordo.componentHandlers[i.data.custom_id]) {
      Cordo.componentHandlers[i.data.custom_id](Cordo.buildReplyableComponentInteraction(i), null /* TODO */)
    } else {
      Logger.warn(`Unhandled component with custom_id "${i.data.custom_id}"`)
      API.interactionCallback(i, InteractionCallbackType.DEFERRED_UPDATE_MESSAGE)
    }
  }

  //

  private static buildReplyableCommandInteraction(i: CommandInteraction): ReplyableCommandInteraction {
    return {
      ...i,
      reply(data: InteractionApplicationCommandCallbackData) {
        API.interactionCallback(i, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, data)
      },
      replyPrivately(data: InteractionApplicationCommandCallbackData) {
        API.interactionCallback(i, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, { ...data, flags: InteractionResponseFlags.EPHEMERAL })
      }
    }
  }

  private static buildReplyableComponentInteraction(i: ComponentInteraction): ReplyableComponentInteraction {
    return {
      ...i,
      ack() {
        API.interactionCallback(i, InteractionCallbackType.DEFERRED_UPDATE_MESSAGE)
      },
      reply(data: InteractionApplicationCommandCallbackData) {
        API.interactionCallback(i, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, data)
      },
      replyPrivately(data: InteractionApplicationCommandCallbackData) {
        API.interactionCallback(i, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, { ...data, flags: InteractionResponseFlags.EPHEMERAL })
      },
      edit(data: InteractionApplicationCommandCallbackData) {
        API.interactionCallback(i, InteractionCallbackType.UPDATE_MESSAGE, data)
      },
      // disableComponents() { TODO
      //   API.interactionCallback(i, InteractionCallbackType.UPDATE_MESSAGE, {
      //     components: i.message.components
      //   })
      // },
      removeComponents() {
        API.interactionCallback(i, InteractionCallbackType.UPDATE_MESSAGE, { components: [] })
      }
    }
  }

}
