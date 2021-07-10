import { GuildData } from '../types/datastructs'
import Logger from '../lib/logger'
import { InteractionApplicationCommandCallbackData, InteractionComponentHandler, InteractionReplyContext, InteractionReplyStateLevelThree, InteractionReplyStateLevelTwo } from './types/custom'
import { InteractionCallbackType, InteractionResponseFlags } from './types/iconst'
import { CommandInteraction, ComponentInteraction, GenericInteraction, InteractionJanitor, ReplyableCommandInteraction, ReplyableComponentInteraction } from './types/ibase'
import API from './api'


export default class CordoReplies {

  /* TODO @metrics */
  private static activeInteractionReplyContexts: InteractionReplyContext[] = []

  //

  public static findActiveInteractionReplyContext(id: string): InteractionReplyContext | undefined {
    return CordoReplies.activeInteractionReplyContexts.find(c => c.id === id)
  }

  //

  private static newInteractionReplyContext(i: GenericInteraction, g: GuildData): InteractionReplyContext {
    return {
      id: i.id,
      interaction: i,
      guildData: g,
      timeout: -1,
      timeoutRunFunc: null,
      timeoutRunner: null,
      resetTimeoutOnInteraction: false,
      handlers: {}
    }
  }

  public static buildReplyableCommandInteraction(i: CommandInteraction): ReplyableCommandInteraction {
    return {
      ...i,
      reply(data: InteractionApplicationCommandCallbackData) {
        API.interactionCallback(i, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, data)
        const context = CordoReplies.newInteractionReplyContext(i, null /* TODO */)
        CordoReplies.activeInteractionReplyContexts.push(context)
        return CordoReplies.getLevelTwoReplyState(context)
      },
      replyPrivately(data: InteractionApplicationCommandCallbackData) {
        API.interactionCallback(i, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, { ...data, flags: InteractionResponseFlags.EPHEMERAL })
      }
    }
  }

  public static buildReplyableComponentInteraction(i: ComponentInteraction): ReplyableComponentInteraction {
    return {
      ...i,
      ack() {
        API.interactionCallback(i, InteractionCallbackType.DEFERRED_UPDATE_MESSAGE)
      },
      reply(data: InteractionApplicationCommandCallbackData) {
        API.interactionCallback(i, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, data)
        const context = CordoReplies.newInteractionReplyContext(i, null /* TODO */)
        CordoReplies.activeInteractionReplyContexts.push(context)
        return CordoReplies.getLevelTwoReplyState(context)
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

  //

  private static getJanitor(context: InteractionReplyContext): InteractionJanitor {
    return {
      edit(data: InteractionApplicationCommandCallbackData) {
        API.interactionCallback(context.interaction, InteractionCallbackType.UPDATE_MESSAGE, data)
      },
      removeComponents() {
        API.interactionCallback(context.interaction, InteractionCallbackType.UPDATE_MESSAGE, { components: [] })
      }
    }
  }

  /**
   * Gets the object to .withTimeout(...) on
   */
  private static getLevelTwoReplyState(context: InteractionReplyContext): InteractionReplyStateLevelTwo {
    return {
      _context: context,
      withTimeout(timeout: number, resetOnInteraction: boolean, janitor: (edit: InteractionJanitor) => any) {
        if (timeout > 15 * 60 * 1000) {
          Logger.error('Interactions timeout cannot be bigger than 15 minutes')
          return {} as any
        }

        context.timeout = timeout
        context.resetTimeoutOnInteraction = resetOnInteraction
        context.timeoutRunFunc = () => {
          janitor(CordoReplies.getJanitor(context))
          delete context.handlers
          context.handlers = null
        }
        context.timeoutRunner = setTimeout(context.timeoutRunFunc, timeout)
        return CordoReplies.getLevelThreeReplyState(context)
      }
    }
  }

  /**
   * Gets the object to .on(...) on
   */
  private static getLevelThreeReplyState(context: InteractionReplyContext): InteractionReplyStateLevelThree {
    const state: InteractionReplyStateLevelThree = {
      _context: context,
      on(customId: string, handler: InteractionComponentHandler) {
        if (!context.handlers) return // => timeout already reached and object destroyed
        context.handlers[customId] = handler
        return state
      }
    }
    return state
  }

}
