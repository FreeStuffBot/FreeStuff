import { Message } from 'discord.js'
import { GuildData } from '../../types/datastructs'
import { Command, ReplyFunction } from '../../types/commands'
import Const from '../const'
import { Core } from '../../index'
import DatabaseManager from '../database-manager'
import Experiments from '../../controller/experiments'


export default class InviteCommand extends Command {

  public constructor() {
    super({
      name: 'invite',
      desc: '=cmd_invite_desc',
      trigger: [ 'get', 'link', 'invite', 'add', 'join' ]
    })
  }

  public handle(_mes: Message, _args: string[], g: GuildData, repl: ReplyFunction): boolean {
    let replyText = Core.text(g, '=cmd_invite_2', { inviteLink: Const.links.botInvite })

    if (Experiments.runExperimentOnServer('slashcommand_hint_invite', g))
      replyText += '\n\n:new: ' + Core.text(g, '=slash_command_introduction_label_long', { command: '/invite' })

    repl(
      Core.text(g, '=cmd_invite_1'),
      replyText
    )
    return true
  }

}
