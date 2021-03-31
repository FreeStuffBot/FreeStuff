import Const from "../const";
import { GuildData, InteractionCommandHandler, Interaction, InteractionReplyFunction } from "../../types";


export default class NewInviteCommand extends InteractionCommandHandler {

  public handle(command: Interaction, data: GuildData, reply: InteractionReplyFunction): boolean {
    reply('ChannelMessageWithSource', {
      title: '=cmd_invite_1',
      description: '=cmd_invite_2',
      context: { inviteLink: Const.links.botInvite }
    })
    return true
  }

}
