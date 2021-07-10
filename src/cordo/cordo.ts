import * as fs from 'fs'
import * as path from 'path'
import Logger from '../lib/logger'
import { Core } from '../index'
import { InteractionCommandHandler, InteractionComponentHandler, InteractionUIState } from './types/custom'
import { InteractionCallbackType, InteractionResponseFlags, InteractionType } from './types/iconst'
import { InteractionCallbackMiddleware } from './types/middleware'
import { CommandInteraction, ComponentInteraction, GenericInteraction } from './types/ibase'
import CordoAPI from './api'
import CordoReplies from './replies'

export default class Cordo {

  private static commandHandlers: { [command: string]: InteractionCommandHandler } = {}
  private static componentHandlers: { [command: string]: InteractionComponentHandler } = {}
  private static uiStates: { [name: string]: InteractionUIState } = {}

  private static middlewares = {
    interactionCallback: [] as InteractionCallbackMiddleware[]
  }

  public static get _data() {
    return {
      commandHandlers: Cordo.commandHandlers,
      componentHandlers: Cordo.componentHandlers,
      uiStates: Cordo.uiStates,
      middlewares: Cordo.middlewares
    }
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

  public static registerUiState(id: string, state: InteractionUIState) {
    if (Cordo.uiStates[id])
      Logger.warn(`UI State for ${id} already exists. Overriding.`)
    Cordo.uiStates[id] = state
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

  public static findUiStates(dir: string | string[], prefix?: string) {
    if (typeof dir !== 'string') dir = path.join(...dir)
    for (const file of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, file)
      const fullName = (prefix ? prefix + '_' : '') + file.split('.')[0]

      if (file.includes('.')) {
        if (!file.endsWith('.js')) continue
        Cordo.registerUiState(fullName, require(fullPath).default)
      } else {
        Cordo.findUiStates(fullPath, fullName)
      }
    }
  }

  public static findContext(dir: string | string[]) {
    if (typeof dir === 'string')
      dir = [ dir ]
    this.findCommandHandlers([ ...dir, 'commands' ])
    this.findComponentHandlers([ ...dir, 'components' ])
    this.findUiStates([ ...dir, 'states' ])
  }

  //

  public static registerMiddlewareForInteractionCallback(fun: InteractionCallbackMiddleware) {
    Cordo.middlewares.interactionCallback.push(fun)
  }

  //

  public static async emitInteraction(i: GenericInteraction) {
    i._answered = false

    if (i.guild_id)
      i.guildData = await Core.databaseManager.getGuildData(i.guild_id)

    if (i.type === InteractionType.COMMAND)
      Cordo.onCommand(i)
    else if (i.type === InteractionType.COMPONENT)
      Cordo.onComponent(i)
    else
      Logger.warn(`Unknown interaction type ${(i as any).type}`)
  }

  private static onCommand(i: CommandInteraction) {
    try {
      for (const option of i.data.options || [])
        i.data.option[option.name] = option.value

      if (Cordo.commandHandlers[i.data.name]) {
        Cordo.commandHandlers[i.data.name](CordoReplies.buildReplyableCommandInteraction(i))
      } else if (Cordo.uiStates[i.data.name + '_main']) {
        CordoReplies.buildReplyableCommandInteraction(i).state(i.data.name + '_main')
      } else {
        Logger.warn(`Unhandled command "${i.data.name}"`)
        CordoAPI.interactionCallback(i, InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE)
      }
    } catch (ex) {
      Logger.warn(ex)
      try {
        CordoAPI.interactionCallback(i, InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE, {
          content: 'We are very sorry but an error occured while processing your command. Please try again.',
          flags: InteractionResponseFlags.EPHEMERAL
        })
      } catch (ex) {
        Logger.warn(ex)
      }
    }
  }

  private static onComponent(i: ComponentInteraction) {
    const context = CordoReplies.findActiveInteractionReplyContext(i.message.interaction?.id)
    if (context?.resetTimeoutOnInteraction) {
      clearTimeout(context.timeoutRunner)
      setTimeout(context.timeoutRunFunc, context.timeout)
    }

    if (context?.handlers[i.data.custom_id]) {
      context.handlers[i.data.custom_id](CordoReplies.buildReplyableComponentInteraction(i))
    } else if (Cordo.componentHandlers[i.data.custom_id]) {
      Cordo.componentHandlers[i.data.custom_id](CordoReplies.buildReplyableComponentInteraction(i))
    } else if (Cordo.uiStates[i.data.custom_id]) {
      CordoReplies.buildReplyableComponentInteraction(i).state()
    } else {
      Logger.warn(`Unhandled component with custom_id "${i.data.custom_id}"`)
      CordoAPI.interactionCallback(i, InteractionCallbackType.DEFERRED_UPDATE_MESSAGE)
    }
  }

}
