import Const from '../const'
import { Interaction, InteractionCommandHandler, InteractionReplyFunction } from '../../types/interactions'
import { GuildData } from '../../types/datastructs'


export default class NewVoteCommand extends InteractionCommandHandler {

  public handle(_command: Interaction, _data: GuildData, reply: InteractionReplyFunction): boolean {
    reply('ChannelMessageWithSource', {
      title: '=cmd_vote_1',
      description: '=cmd_vote_2',
      context: {
        topGGLink: Const.links.topgg,
        dblLink: Const.links.dbl,
        dlabsLink: Const.links.dlabs
      }
    })
    return true
  }

}
