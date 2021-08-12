import { Message } from 'discord.js'
import { GuildData } from '../../types/datastructs'
import { Command, ReplyFunction } from '../../types/commands'
import { Core } from '../../index'
import Experiments from '../../controller/experiments'


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
    let replyText = Core.text(g, '=cmd_help_2') + '\n\n' + cmdlist.join('\n\n')

    if (Experiments.runExperimentOnServer('slashcommand_hint_help', g))
      replyText += '\n\n:new: ' + Core.text(g, '=slash_command_introduction_label_long', { command: '/help' })

    repl(
      Core.text(g, '=cmd_help_1'),
      replyText
    )
    return true
  }

}
