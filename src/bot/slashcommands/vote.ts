import Const from "../const";
import { GuildData, InteractionCommandHandler, Interaction, InteractionReplyFunction } from "../../types";


export default class NewVoteCommand extends InteractionCommandHandler {

  public handle(command: Interaction, data: GuildData, reply: InteractionReplyFunction): boolean {
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
