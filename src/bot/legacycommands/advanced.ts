import { Message } from 'discord.js'
import { GuildData } from '../../types/datastructs'
import { Command, ReplyFunction } from '../../types/commands'
import Const from '../const'
import { Core } from '../../index'
import Experiments from '../../controller/experiments'


export default class AdvancedCommand extends Command {

  private readonly raw = [
    [ 'check', '=cmd_check_desc' ],
    [ 'resend', '=cmd_resend_desc' ],
    [ 'mydata', '=cmd_mydata_desc' ],
    [ 'reset', '=cmd_reset_desc' ],
    [ 'beta', '=cmd_beta_desc' ]
  ]

  public constructor() {
    super({
      name: 'advanced',
      desc: '=cmd_advanced_desc',
      trigger: [ 'advanced' ]
    })
  }

  public handle(mes: Message, _args: string[], g: GuildData, repl: ReplyFunction): boolean {
    if (Experiments.runExperimentOnServer('slashcommand_hint_settings', g)) {
      repl(
        Core.text(g, '=slash_command_introduction_info_short'),
        Core.text(g, '=slash_command_introduction_label_short', { command: '/settings' })
      )
      return true
    }

    const commands = this.raw.map(c => `• \`@${mes.guild.me.user.username} ${c[0]}\` ─ ${Core.text(g, c[1])}`)

    repl(
      Core.text(g, '=cmd_advanced_1'),
      [
        Core.text(g, '=cmd_advanced_2'),
        commands.join('\n\n'), Core.text(g, '=cmd_advanced_bottom_text', { privacy: Const.links.privacy, terms: Const.links.terms })
      ].join('\n\n')
    )
    return true
  }

}
