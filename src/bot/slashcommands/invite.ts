import Const from '../const'
import { Interaction, InteractionCommandHandler, InteractionReplyFunction } from '../../types/interactions'
import { GuildData } from '../../types/datastructs'


export default class NewInviteCommand extends InteractionCommandHandler {

  public handle(_command: Interaction, _data: GuildData, reply: InteractionReplyFunction): boolean {
    reply('ChannelMessageWithSource', {
      title: '=cmd_invite_1',
      description: '=cmd_invite_2',
      context: { inviteLink: Const.links.botInvite }
    })
    return true
  }

}
