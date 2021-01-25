import Axios from 'axios'
import { Interaction, InteractionApplicationCommandCallbackData, InteractionResponseType, InteractionCommandHandler, InteractionReplyFunction, InteractionResponseFlags } from '../types'
import { Core, FreeStuffBot } from '../index'
import NewFreeCommand from './slashcommands/free'
import { MessageEmbed } from 'discord.js'


export default class InteractionReceiver {

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

    this.HANDLER.free = new NewFreeCommand()
    // this.HANDLER.admin = new AdminHandler()
  }

  private runCommand(interaction: Interaction, handler: InteractionCommandHandler) {
    const reply = this.getReplyFunction(interaction)
    Core.databaseManager.getGuildData(interaction.guild_id).then(data => {
      handler.handle(interaction, data, reply)
    }).catch(err => {
      try {
        reply('ChannelMessageWithSource', {
          content: 'We are very sorry but an error occured while processing your command. Please try again.',
          flags: InteractionResponseFlags.EPHEMERAL
        })
      } catch(ex) { }
    });
  }

  private onInteraction(i: Interaction) {
    if (this.HANDLER[i.data.name])
      this.runCommand(i, this.HANDLER[i.data.name])
    else
      console.log(`Unhandled command "${i.data.name}"`)
  }

  private getReplyFunction(i: Interaction): InteractionReplyFunction {
    const types: InteractionResponseType[] = [ 'Pong', 'Acknowledge', 'ChannelMessage', 'ChannelMessageWithSource', 'AcknowledgeWithSource' ]
    return (type: InteractionResponseType, data?: InteractionApplicationCommandCallbackData | Partial<MessageEmbed>) => {
      if (!('content' in data)) {
        data.color = data.color ?? 0x2f3136
        data = {
          content: '',
          embeds: [{
            ...data
          }]
        }
      }
      Axios.post(`https://discord.com/api/v8/interactions/${i.id}/${i.token}/callback`, { type: types.indexOf(type) + 1, data })
    }
  }

}
