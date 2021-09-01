import { Message } from 'discord.js'
import { GuildData } from '../../types/datastructs'
import { Command, CommandHandler, ReplyFunction, SettingsSubcommand } from '../../types/commands'
import { Core } from '../../index'
import Const from '../const'
import Logger from '../../lib/logger'
import Experiments from '../../controller/experiments'


export default class SettingsCommand extends Command {

  public readonly commands: Map<string, (CommandHandler & SettingsSubcommand)> = new Map()

  public constructor() {
    super({
      name: 'settings',
      desc: '=cmd_settings_desc',
      trigger: [ 'set', 'settings', 'setting', 'config', 'configure', 'change' ],
      serverManagerOnly: true
    })
  }

  public handle(mes: Message, args: string[], g: GuildData, repl: ReplyFunction): boolean {
    if (Experiments.runExperimentOnServer('slashcommand_hint_settings', g)) {
      repl(
        Core.text(g, '=slash_command_introduction_info_short'),
        Core.text(g, '=slash_command_introduction_label_short', { command: '/settings' })
      )
      return true
    }

    if (!g) {
      repl(
        Core.text(g, '=cmd_error_readd_1'),
        Core.text(g, '=cmd_error_readd_2', {
          discordInvite: Const.links.botInvite
        })
      )
      return true
    }

    if (args.length < 1) {
      try {
        const cmdlist = Array.from(this.commands.values())
          .map(c => c.getMetaInfo(g))
          .filter(c => !!c)
          .map(c => ((typeof c[0] === 'string') ? [ c ] : c) as ([ string, string, any? ])[])
          .map(c => c.map(e => `• \`@${mes.guild.me.user.username} set ${e[0]}\` ─ ${Core.text(g, e[1], e[2])}`))
        const cmdlistFlat = [].concat.apply([], cmdlist)

        mes.channel.send({
          embeds: [
            {
              title: Core.text(g, '=cmd_settings_missing_args_1'),
              description: Core.text(g, '=cmd_settings_missing_args_2') + '\n\n' + cmdlistFlat.join('\n\n'),
              footer: { text: `@${mes.author.tag}` },
              color: 0x2F3136
            }
          ]
        })
        return true
      } catch (ex) { Logger.error(ex) }
    }

    for (const key of this.commands.keys()) {
      if (key.split(' ').includes(args[0].toLowerCase())) {
        const command = this.commands.get(key)
        args.splice(0, 1)
        command.handle(mes, args, g, repl)
        return true
      }
    }

    repl(
      Core.text(g, '=cmd_settings_not_found_1', { name: args[0] }),
      Core.text(g, '=cmd_settings_not_found_2')
    )

    return true
  }

}
