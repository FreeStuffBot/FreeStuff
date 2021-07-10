import * as fs from 'fs'
import * as path from 'path'
import Axios from 'axios'
import { GuildData } from '../types/datastructs'
import { InteractionApplicationCommandCallbackData, InteractionResponseType, InteractionCommandHandler, InteractionReplyFunction, InteractionResponseFlags, GenericInteraction, CommandInteraction, InteractionType, InteractionReplyContext, InteractionReplyStateLevelTwo, InteractionEditFunction, InteractionReplyStateLevelThree, InteractionComponentHandler } from '../types/interactions'
import { config, Core } from '../index'
import FreeStuffBot from '../freestuffbot'
import Logger from '../lib/logger'
import NewFreeCommand from './commands/free'
import NewVoteCommand from './commands/vote'
import NewHelpCommand from './commands/help'
import NewAboutCommand from './commands/about'
import NewInviteCommand from './commands/invite'
import NewTestCommand from './commands/test'


export default class InteractionHandler {

  private readonly COMMAND_HANDLER: { [token: string]: InteractionCommandHandler } = {}

  /* TODO @metrics */
  private activeInteractionReplyContexts: InteractionReplyContext[] = []

  private globalInteractionComponentHandlers: { [id: string]: InteractionComponentHandler } = {}

  //

  public constructor(bot: FreeStuffBot) {
    bot.on('raw', (event: Event) => {
      const ev: any = event
      if (ev.t === 'INTERACTION_CREATE') {
        const i = ev.d
        for (const option of i.options || [])
          i.option[option.name] = option.value
        this.onInteraction(i)
      }
    })

    this.COMMAND_HANDLER.about = new NewAboutCommand()
    this.COMMAND_HANDLER.free = new NewFreeCommand()
    this.COMMAND_HANDLER.help = new NewHelpCommand()
    this.COMMAND_HANDLER.invite = new NewInviteCommand()
    this.COMMAND_HANDLER.test = new NewTestCommand()
    this.COMMAND_HANDLER.vote = new NewVoteCommand()
    // this.HANDLER.admin = new AdminHandler()

    this.loadButtonHandlers(path.join(__dirname, 'components'), '')
  }

  private loadButtonHandlers(dir: string, prefix: string) {
    for (const file of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, file)
      const fullName = prefix + '_' + file.split('.')[0]
      if (file.includes('.')) {
        if (!file.endsWith('.js')) continue
        this.globalInteractionComponentHandlers[fullName.substr(1)] = require(fullPath).default
      } else {
        this.loadButtonHandlers(fullPath, fullName)
      }
    }
  }

  //

  private async runCommand(interaction: CommandInteraction, handler: InteractionCommandHandler) {
    try {
      const data = interaction.guild_id
        ? await Core.databaseManager.getGuildData(interaction.guild_id)
        : undefined

      const reply = this.getReplyFunction(interaction, data)
      handler.handle(interaction, data, reply)
    } catch (ex) {
      Logger.warn(ex)
      try {
        const reply = this.getReplyFunction(interaction, null)
        reply('ChannelMessageWithSource', {
          content: 'We are very sorry but an error occured while processing your command. Please try again.',
          flags: InteractionResponseFlags.EPHEMERAL
        })
      } catch (ex) {
        Logger.warn(ex)
      }
    }
  }

  private onInteraction(i: GenericInteraction) {
    if (i.type === InteractionType.COMMAND) {
      if (this.COMMAND_HANDLER[i.data.name]) {
        this.runCommand(i, this.COMMAND_HANDLER[i.data.name])
      } else {
        Logger.warn(`Unhandled command "${i.data.name}"`)
        Axios.post(`https://discord.com/api/v8/interactions/${i.id}/${i.token}/callback`, { type: 5 /* DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE */ })
      }
    } else if (i.type === InteractionType.COMPONENT) {
      const editFunction: InteractionEditFunction = (data: InteractionApplicationCommandCallbackData) => {
        this.normaliseData(data, context.guildData)
        if (!data) (data as any) = {}
        Axios.post(`https://discord.com/api/v8/interactions/${i.id}/${i.token}/callback`, { type: 7 /* UPDATE_MESSAGE */, data })
      }

      const context: InteractionReplyContext | undefined = this.activeInteractionReplyContexts.find(c => c.id === i.message.interaction?.id)
      if (context?.resetTimeoutOnInteraction) {
        clearTimeout(context.timeoutRunner)
        setTimeout(context.timeoutRunFunc, context.timeout)
      }

      if (context?.handlers[i.data.custom_id]) {
        context.handlers[i.data.custom_id](i.data, editFunction)
      } else if (this.globalInteractionComponentHandlers[i.data.custom_id]) {
        this.globalInteractionComponentHandlers[i.data.custom_id](i.data, editFunction)
      } else {
        Logger.warn(`Unhandled component with custom_id "${i.data.custom_id}"`)
        Axios.post(`https://discord.com/api/v8/interactions/${i.id}/${i.token}/callback`, { type: 6 /* DEFERRED_UPDATE_MESSAGE */ })
      }
    }
  }

  /**
   * Gets your default reply(...) function
   */
  private getReplyFunction(i: GenericInteraction, guild?: GuildData): InteractionReplyFunction {
    const types: InteractionResponseType[] = [ 'Pong', 'deprecated-Acknowledge', 'deprecated-ChannelMessage', 'ChannelMessageWithSource', 'DeferredChannelMessageWithSource', 'DeferredUpdateMessage', 'UpdateMessage' ]
    return (type: InteractionResponseType, data?: InteractionApplicationCommandCallbackData) => {
      this.normaliseData(data, guild)
      if (!data) (data as any) = {}
      Axios.post(`https://discord.com/api/v8/interactions/${i.id}/${i.token}/callback`, { type: types.indexOf(type) + 1, data })

      const context: InteractionReplyContext = {
        id: i.id,
        interaction: i,
        guildData: guild,
        timeout: -1,
        timeoutRunFunc: null,
        timeoutRunner: null,
        resetTimeoutOnInteraction: false,
        handlers: []
      }

      this.activeInteractionReplyContexts.push(context)
      return this.getLevelTwoReplyState(context)
    }
  }

  /**
   * Gets the object to .withTimeout(...) on
   */
  private getLevelTwoReplyState(context: InteractionReplyContext): InteractionReplyStateLevelTwo {
    const getLevelThreeReplyState = this.getLevelThreeReplyState
    const normaliseData = this.normaliseData
    return {
      _context: context,
      withTimeout(timeout: number, resetOnInteraction: boolean, janitor: (edit: InteractionEditFunction) => any) {
        if (timeout > 15 * 60 * 1000) {
          Logger.error('Interactions timeout cannot be bigger than 15 minutes')
          return {} as any
        }

        context.timeout = timeout
        context.resetTimeoutOnInteraction = resetOnInteraction
        context.timeoutRunFunc = () => {
          const editFunction: InteractionEditFunction = (data: InteractionApplicationCommandCallbackData) => {
            normaliseData(data, context.guildData)
            if (!data) (data as any) = {}
            Axios.patch(`https://discord.com/api/v8/webhooks/${config.bot.clientid}/${context.interaction.token}/messages/@original`, data)
          }
          janitor(editFunction)
          delete context.handlers
          context.handlers = null
        }
        context.timeoutRunner = setTimeout(context.timeoutRunFunc, timeout)
        return getLevelThreeReplyState(context)
      }
    }
  }

  /**
   * Gets the object to .on(...) on
   */
  private getLevelThreeReplyState(context: InteractionReplyContext): InteractionReplyStateLevelThree {
    const state: InteractionReplyStateLevelThree = {
      _context: context,
      on(customId: string, handler: (event: any, edit: InteractionEditFunction) => any) {
        if (!context.handlers) return // => timeout already reached and object destroyed
        context.handlers[customId] = handler
        return state
      }
    }
    return state
  }

}
