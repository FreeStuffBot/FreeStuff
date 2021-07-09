import Axios from 'axios'
import { GuildData } from '../types/datastructs'
import { InteractionApplicationCommandCallbackData, InteractionResponseType, InteractionCommandHandler, InteractionReplyFunction, InteractionResponseFlags, GenericInteraction, CommandInteraction, InteractionType, InteractionReplyContext, InteractionReplyStateLevelTwo, InteractionEditFunction, InteractionReplyStateLevelThree } from '../types/interactions'
import { config, Core } from '../index'
import FreeStuffBot from '../freestuffbot'
import Logger from '../lib/logger'
import NewFreeCommand from './commands/free'
import NewVoteCommand from './commands/vote'
import NewHelpCommand from './commands/help'
import NewAboutCommand from './commands/about'
import NewInviteCommand from './commands/invite'
import NewTestCommand from './commands/test'
import NewSettingsCommand from './commands/settings'


export default class InteractionHandler {

  private readonly COMMAND_HANDLER: { [token: string]: InteractionCommandHandler } = {}

  /* TODO @metrics */
  private activeInteractionReplyContexts: InteractionReplyContext[] = []

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
    this.COMMAND_HANDLER.settings = new NewSettingsCommand()
    // this.HANDLER.admin = new AdminHandler()
  }

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
      const context = this.activeInteractionReplyContexts.find(c => c.id === i.message.interaction?.id)
      if (!context) return
      if (context.handlers[i.data.custom_id]) {
        const editFunction: InteractionEditFunction = (data: InteractionApplicationCommandCallbackData) => {
          this.normaliseData(data, context.guildData)
          if (!data) (data as any) = {}
          Axios.post(`https://discord.com/api/v8/interactions/${i.id}/${i.token}/callback`, { type: 7 /* UPDATE_MESSAGE */, data })
        }
        context.handlers[i.data.custom_id](i.data, editFunction)

        if (context.resetTimeoutOnInteraction) {
          clearTimeout(context.timeoutRunner)
          setTimeout(context.timeoutRunFunc, context.timeout)
        }
      } else {
        Logger.warn(`Unhandled component with custom_id "${i.data.custom_id}"`)
        Axios.post(`https://discord.com/api/v8/interactions/${i.id}/${i.token}/callback`, { type: 6 /* DEFERRED_UPDATE_MESSAGE */ })
      }
    }
  }

  private translateObject(object: any, guildData: GuildData | undefined, context: any, maxDepth: number) {
    if (maxDepth <= 0) return
    for (const key in object) {
      if (key === 'context') continue
      if (typeof object[key] === 'object') this.translateObject(object[key], guildData, context, maxDepth--)
      else if (typeof object[key] === 'string') object[key] = Core.text(guildData, object[key], context)
    }
  }

  private normaliseData(data?: InteractionApplicationCommandCallbackData, guild?: GuildData) {
    if (!data) return
    // explicitly not using this. in this function due to unwanted side-effects in lambda functions
    Core.interactionsHandler.translateObject(data, guild, data._context, 10)

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
