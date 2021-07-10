import Const from '../const'
import { CommandInteraction, InteractionCommandHandler, InteractionReplyFunction } from '../../types/interactions'
import { GuildData } from '../../types/datastructs'


export default class NewInviteCommand extends InteractionCommandHandler {

  public handle(_command: CommandInteraction, _data: GuildData, reply: InteractionReplyFunction): boolean {
    reply('ChannelMessageWithSource', {
      title: '=cmd_invite_1',
      description: '=cmd_invite_2',
      _context: { inviteLink: Const.links.botInvite }
    })
    return true
  }

}
