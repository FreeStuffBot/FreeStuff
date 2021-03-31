import { GuildData, InteractionCommandHandler, Interaction, InteractionReplyFunction } from "../../types";


export default class NEW_TEMPLATE_COMMAND extends InteractionCommandHandler {

  public handle(command: Interaction, data: GuildData, reply: InteractionReplyFunction): boolean {
    reply('ChannelMessageWithSource', {
      description: ''
    })
    return true
  }

}
