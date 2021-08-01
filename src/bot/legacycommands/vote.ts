import { Message } from 'discord.js'
import Const from '../const'
import { Core } from '../../index'
import { GuildData } from '../../types/datastructs'
import { Command, ReplyFunction } from '../../types/commands'
import Experiments from '../../controller/experiments'


export default class VoteCommand extends Command {

  public constructor() {
    super({
      name: 'vote',
      desc: '=cmd_vote_desc',
      trigger: [ 'vote', 'topgg', 'top', 'botlist', 'v' ]
    })
  }

  public handle(_mes: Message, _args: string[], g: GuildData, repl: ReplyFunction): boolean {
    let replyText = Core.text(g, '=cmd_vote_2', {
      topGGLink: Const.links.topgg,
      dblLink: Const.links.dbl,
      dlabsLink: Const.links.dlabs
    })

    if (Experiments.runExperimentOnServer('slashcommand_hint_vote', g))
      replyText += '\n\n:new: ' + Core.text(g, '=slash_command_introduction_label_long', { command: '/vote' })

    repl(
      Core.text(g, '=cmd_vote_1'),
      replyText
    )
    return true
  }

}
