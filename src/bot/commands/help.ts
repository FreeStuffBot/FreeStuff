import { Message } from 'discord.js'
import { ReplyFunction, Command, GuildData } from '../../types'
import { Core } from '../../index'


export default class HelpCommand extends Command {

  public constructor() {
    super({
      name: 'help',
      desc: '=cmd_help_desc',
      trigger: [ 'help', '?' ],
      hideOnHelp: true
    })
  }

  public handle(mes: Message, _args: string[], g: GuildData, repl: ReplyFunction): boolean {
    const cmdlist = Core.commandHandler.commands
      .filter(c => !c.info.hideOnHelp)
      .map(c => `• \`@${mes.guild.me.user.username} ${c.info.name}\` ─ ${Core.text(g, c.info.desc)}`)

    repl(
      Core.text(g, '=cmd_help_1'),
      Core.text(g, '=cmd_help_2') + '\n\n' + cmdlist.join('\n\n')
    )
    return true
  }

}
