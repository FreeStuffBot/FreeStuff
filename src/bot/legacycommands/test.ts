import { Message } from 'discord.js'
import { GuildData } from '../../types/datastructs'
import { Command, ReplyFunction } from '../../types/commands'
import { Core, config } from '../../index'
import DatabaseManager from '../database-manager'
import Const from '../const'
import ParseArgs from '../../lib/parse-args'
import MessageDistributor from '../../bot/message-distributor'
import Experiments from '../../controller/experiments'


export default class TestCommand extends Command {

  private testCooldown = [ ]
  private testCooldownHarsh = [ ]

  public constructor() {
    super({
      name: 'test',
      desc: '=cmd_test_desc',
      trigger: [ 'test' ],
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

    if (this.testCooldownHarsh.includes(mes.guild.id))
      return true
    if (this.testCooldown.includes(mes.guild.id)) {
      repl(
        Core.text(g, '=cmd_on_cooldown_1'),
        Core.text(g, '=cmd_on_cooldown_2', { time: '10' })
      )
      this.testCooldownHarsh.push(mes.guild.id)
      return true
    }

    if (!g) {
      DatabaseManager.addGuild(mes.guild)
      repl(
        Core.text(g, '=cmd_error_fixable_1'),
        Core.text(g, '=cmd_error_fixable_2', { discordInvite: Const.links.supportInvite })
      )
      return true
    }
    if (!g.channelInstance) {
      repl(
        Core.text(g, '=cmd_test_nochannel_1'),
        Core.text(g, '=cmd_test_nochannel_2', { channel: `#${mes.guild.channels.cache.filter(c => c.type === 'text').random().name}` })
      )
      return true
    }
    if (!g.channelInstance.guild.me.permissionsIn(g.channelInstance).has('VIEW_CHANNEL')) {
      repl(
        Core.text(g, '=cmd_test_nosee_1'),
        Core.text(g, '=cmd_test_nosee_2', { channel: g.channelInstance.toString() })
      )
      return true
    }
    if (!g.channelInstance.guild.me.permissionsIn(g.channelInstance).has('SEND_MESSAGES')) {
      repl(
        Core.text(g, '=cmd_test_nosend_1'),
        Core.text(g, '=cmd_test_nosend_2', { channel: g.channelInstance.toString() })
      )
      return true
    }
    if (!g.channelInstance.guild.me.permissionsIn(g.channelInstance).has('EMBED_LINKS')
        && g.theme.usesEmbeds) {
      repl(
        Core.text(g, '=cmd_test_noembeds_1'),
        Core.text(g, '=cmd_test_noembeds_2', { channel: g.channelInstance.toString() })
      )
      return true
    }

    const flags = ParseArgs.parse(args)

    try {
      MessageDistributor.test(mes.guild, Const.testAnnouncementContent)
    } catch (ex) {
      if (Object.keys(flags)) {
        repl('Yikes', 'Some of the flags you set caused errors. Try removing them.')
      } else {
        repl(
          Core.text(g, '=cmd_error_fixable_1'),
          Core.text(g, '=cmd_error_fixable_2')
        )
      }
    }

    if (config.admins?.includes(mes.author.id)) return true

    this.testCooldown.push(mes.guild.id)
    setTimeout(() => {
      this.testCooldown.splice(this.testCooldown.indexOf(mes.guild.id), 1)
      this.testCooldownHarsh.splice(this.testCooldownHarsh.indexOf(mes.guild.id), 1)
    }, 1000 * 10)
    return true
  }

}
