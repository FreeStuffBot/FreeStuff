import { Message } from 'discord.js'
import { ReplyFunction, Command, GuildData } from '../../types'
import Const from '../const'
import { Core } from '../../index'


export default class InviteCommand extends Command {

  public constructor() {
    super({
      name: 'invite',
      desc: '=cmd_invite_desc',
      trigger: [ 'get', 'link', 'invite', 'add', 'join' ]
    })
  }

  public handle(_mes: Message, _args: string[], g: GuildData, repl: ReplyFunction): boolean {
    repl(
      Core.text(g, '=cmd_invite_1'),
      Core.text(g, '=cmd_invite_2', { inviteLink: Const.links.botInvite })
    )
    return true
  }

}
