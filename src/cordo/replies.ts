import Logger from '../lib/logger'
import { InteractionApplicationCommandCallbackData, InteractionComponentHandler, InteractionReplyContext, InteractionReplyStateLevelThree, InteractionReplyStateLevelTwo } from './types/custom'
import { InteractionCallbackType, InteractionResponseFlags } from './types/iconst'
import { CommandInteraction, ComponentInteraction, GenericInteraction, InteractionJanitor, ReplyableCommandInteraction, ReplyableComponentInteraction } from './types/ibase'
import CordoAPI from './api'
import Cordo from './cordo'


export default class CordoReplies {

  /* TODO @metrics */
  private static activeInteractionReplyContexts: InteractionReplyContext[] = []

  //

  public static findActiveInteractionReplyContext(id: string): InteractionReplyContext | undefined {
    return CordoReplies.activeInteractionReplyContexts.find(c => c.id === id)
  }

  //

  private static newInteractionReplyContext(i: GenericInteraction): InteractionReplyContext {
    return {
      id: i.id,
      interaction: i,
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
        CordoAPI.interactionCallback(i, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, data)
      },
      replyInteractive(data: InteractionApplicationCommandCallbackData) {
        CordoAPI.interactionCallback(i, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, data)
        const context = CordoReplies.newInteractionReplyContext(i)
        CordoReplies.activeInteractionReplyContexts.push(context)
        return CordoReplies.getLevelTwoReplyState(context)
      },
      replyPrivately(data: InteractionApplicationCommandCallbackData) {
        CordoAPI.interactionCallback(i, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, { ...data, flags: InteractionResponseFlags.EPHEMERAL })
      },
      async state(state?: string, ...args: any) {
        if (!state) state = i.data.id

        if (!Cordo._data.uiStates[state]) {
          Logger.warn(`Component ${i.data.custom_id} tried to apply state non-existant ${state}`)
          return
        }

        let data = Cordo._data.uiStates[state](i, args)
        if ((data as any).then) data = await data
        CordoAPI.interactionCallback(i, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, data as InteractionApplicationCommandCallbackData)
      }
    }
  }

  public static buildReplyableComponentInteraction(i: ComponentInteraction): ReplyableComponentInteraction {
    return {
      ...i,
      ack() {
        CordoAPI.interactionCallback(i, InteractionCallbackType.DEFERRED_UPDATE_MESSAGE)
      },
      reply(data: InteractionApplicationCommandCallbackData) {
        CordoAPI.interactionCallback(i, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, data)
      },
      replyInteractive(data: InteractionApplicationCommandCallbackData) {
        CordoAPI.interactionCallback(i, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, data)
        const context = CordoReplies.newInteractionReplyContext(i)
        CordoReplies.activeInteractionReplyContexts.push(context)
        return CordoReplies.getLevelTwoReplyState(context)
      },
      replyPrivately(data: InteractionApplicationCommandCallbackData) {
        CordoAPI.interactionCallback(i, InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, { ...data, flags: InteractionResponseFlags.EPHEMERAL })
      },
      edit(data: InteractionApplicationCommandCallbackData) {
        CordoAPI.interactionCallback(i, InteractionCallbackType.UPDATE_MESSAGE, data)
      },
      editInteractive(data: InteractionApplicationCommandCallbackData) {
        CordoAPI.interactionCallback(i, InteractionCallbackType.UPDATE_MESSAGE, data)
        const context = CordoReplies.newInteractionReplyContext(i)
        CordoReplies.activeInteractionReplyContexts.push(context)
        return CordoReplies.getLevelTwoReplyState(context)
      },
      // disableComponents() { TODO
      //   API.interactionCallback(i, InteractionCallbackType.UPDATE_MESSAGE, {
      //     components: i.message.components
      //   })
      // },
      removeComponents() {
        CordoAPI.interactionCallback(i, InteractionCallbackType.UPDATE_MESSAGE, { components: [] })
      },
      async state(state?: string, ...args: any) {
        if (!state) state = i.data.custom_id

        if (!Cordo._data.uiStates[state]) {
          Logger.warn(`Component ${i.data.custom_id} tried to apply state non-existant ${state}`)
          return
        }

        let data = Cordo._data.uiStates[state](i, args)
        if ((data as any).then) data = await data
        CordoAPI.interactionCallback(i, InteractionCallbackType.UPDATE_MESSAGE, data as InteractionApplicationCommandCallbackData)
      }
    }
  }

  //

  private static getJanitor(context: InteractionReplyContext): InteractionJanitor {
    return {
      edit(data: InteractionApplicationCommandCallbackData) {
        CordoAPI.interactionCallback(context.interaction, InteractionCallbackType.UPDATE_MESSAGE, data)
      },
      removeComponents() {
        CordoAPI.interactionCallback(context.interaction, InteractionCallbackType.UPDATE_MESSAGE, { components: [] })
      },
      async state(state?: string, ...args: any) {
        if (!state) state = context.interaction.id

        if (!Cordo._data.uiStates[state]) {
          Logger.warn(`Janitor tried to apply state non-existant ${state}`)
          return
        }

        let data = Cordo._data.uiStates[state](context.interaction, args)
        if ((data as any).then) data = await data
        CordoAPI.interactionCallback(context.interaction, InteractionCallbackType.UPDATE_MESSAGE, data as InteractionApplicationCommandCallbackData)
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
