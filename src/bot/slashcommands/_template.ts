import { GuildData, InteractionCommandHandler, Interaction, InteractionReplyFunction } from '../../types'


export default class NEW_TEMPLATE_COMMAND extends InteractionCommandHandler {

  public handle(_command: Interaction, _data: GuildData, reply: InteractionReplyFunction): boolean {
    reply('ChannelMessageWithSource', {
      title: '',
      description: ''
    })
    return true
  }

}
