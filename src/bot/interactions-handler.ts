import Axios from 'axios'
import { MessageEmbed } from 'discord.js'
import { GuildData } from '../types/datastructs'
import { Interaction, InteractionApplicationCommandCallbackData, InteractionResponseType, InteractionCommandHandler, InteractionReplyFunction, InteractionResponseFlags } from '../types/interactions'
import { Core } from '../index'
import FreeStuffBot from '../freestuffbot'
import Logger from '../lib/logger'
import NewFreeCommand from './slashcommands/free'
import NewVoteCommand from './slashcommands/vote'
import NewHelpCommand from './slashcommands/help'
import NewAboutCommand from './slashcommands/about'
import NewInviteCommand from './slashcommands/invite'
import NewTestCommand from './slashcommands/test'


export default class InteractionHandler {

  private readonly HANDLER: { [token: string]: InteractionCommandHandler } = {}

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

    this.HANDLER.about = new NewAboutCommand()
    this.HANDLER.free = new NewFreeCommand()
    this.HANDLER.help = new NewHelpCommand()
    this.HANDLER.invite = new NewInviteCommand()
    this.HANDLER.test = new NewTestCommand()
    this.HANDLER.vote = new NewVoteCommand()
    // this.HANDLER.admin = new AdminHandler()
  }

  private async runCommand(interaction: Interaction, handler: InteractionCommandHandler) {
    // TODO interaction.guild_id can be undefined if ran in DMs, maybe have a DM guilddata template object or something? Just with default settings.
    try {
      const data = interaction.guild_id
        ? await Core.databaseManager.getGuildData(interaction.guild_id)
        : undefined

      const reply = this.getReplyFunction(interaction, data)
      handler.handle(interaction, data, reply)
    } catch (ex) {
      try {
        const reply = this.getReplyFunction(interaction, null)
        reply('ChannelMessageWithSource', {
          content: 'We are very sorry but an error occured while processing your command. Please try again.',
          flags: InteractionResponseFlags.EPHEMERAL
        })
      } catch (ex) { }
    }
  }

  private onInteraction(i: Interaction) {
    if (this.HANDLER[i.data.name]) {
      this.runCommand(i, this.HANDLER[i.data.name])
    } else {
      Logger.warn(`Unhandled command "${i.data.name}"`)
      const reply = this.getReplyFunction(i, null)
      reply('DeferredChannelMessageWithSource', { })
    }
  }

  private translateObject(object: any, guildData: GuildData, context: any) {
    for (const key in object) {
      if (key === 'context') continue
      if (typeof object[key] === 'object') this.translateObject(object[key], guildData, context)
      else if (typeof key === 'string') object[key] = Core.text(guildData, object[key], context)
    }
  }

  private getReplyFunction(i: Interaction, guildData?: GuildData): InteractionReplyFunction {
    const types: InteractionResponseType[] = [ 'Pong', 'deprecated-Acknowledge', 'deprecated-ChannelMessage', 'ChannelMessageWithSource', 'DeferredChannelMessageWithSource' ]
    return (type: InteractionResponseType, data?: (InteractionApplicationCommandCallbackData | Partial<MessageEmbed>) & {context?: any}) => {
      this.translateObject(data, guildData, data.context)

      if (!('content' in data)) {
        data.color = data.color ?? 0x2F3136
        data = {
          content: '',
          embeds: [ {
            ...data
          } ]
        }
      }
      Axios.post(`https://discord.com/api/v8/interactions/${i.id}/${i.token}/callback`, { type: types.indexOf(type) + 1, data })
    }
  }

}
