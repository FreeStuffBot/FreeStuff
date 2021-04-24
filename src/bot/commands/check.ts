import { Message } from 'discord.js'
import { GuildData } from '../../types/datastructs'
import { Command, ReplyFunction } from '../../types/commands'
import { Core } from '../../index'
import Const from '../const'


export default class CheckCommand extends Command {

  private checkCooldown = [ ];
  private checkCooldownHarsh = [ ];

  public constructor() {
    super({
      name: 'check',
      desc: '=cmd_check_desc',
      trigger: [ 'check' ],
      hideOnHelp: true,
      serverManagerOnly: true
    })
  }

  public handle(mes: Message, _args: string[], g: GuildData, repl: ReplyFunction): boolean {
    if (this.checkCooldownHarsh.includes(mes.guild.id))
      return true
    if (this.checkCooldown.includes(mes.guild.id)) {
      repl(
        Core.text(g, '=cmd_on_cooldown_1'),
        Core.text(g, '=cmd_on_cooldown_2', { time: '10' })
      )
      this.checkCooldownHarsh.push(mes.guild.id)
      return true
    }

    if (!g) {
      Core.databaseManager.addGuild(mes.guild)
      repl(
        Core.text(g, '=cmd_error_fixable_1'),
        Core.text(g, '=cmd_error_fixable_2', { discordInvite: Const.links.supportInvite })
      )
      return
    }
    if (!g.channelInstance) {
      repl(
        Core.text(g, '=cmd_check_nochannel_1'),
        Core.text(g, '=cmd_check_nochannel_2', { channel: `#${mes.guild.channels.cache.filter(c => c.type === 'text').random().name}` })
      )
      return true
    }
    if (!g.channelInstance.guild.me.permissionsIn(g.channelInstance).has('VIEW_CHANNEL')) {
      repl(
        Core.text(g, '=cmd_check_nosee_1'),
        Core.text(g, '=cmd_check_nosee_2', { channel: g.channelInstance.toString() })
      )
      return true
    }
    if (!g.channelInstance.guild.me.permissionsIn(g.channelInstance).has('SEND_MESSAGES')) {
      repl(
        Core.text(g, '=cmd_check_nosend_1'),
        Core.text(g, '=cmd_check_nosend_2', { channel: g.channelInstance.toString() })
      )
      return true
    }
    if (!g.channelInstance.guild.me.permissionsIn(g.channelInstance).has('EMBED_LINKS')
        && Const.themesWithEmbeds.includes(g.theme)) {
      repl(
        Core.text(g, '=cmd_check_noembeds_1'),
        Core.text(g, '=cmd_check_noembeds_2', { channel: g.channelInstance.toString() })
      )
      return true
    }
    if (!g.channelInstance.guild.me.permissionsIn(g.channelInstance).has('USE_EXTERNAL_EMOJIS')
        && Const.themesWithExtemotes[g.theme]) {
      repl(
        Core.text(g, '=cmd_check_extemotes_1'),
        Core.text(g, '=cmd_check_extemotes_2')
      )
      return true
    }

    repl(
      Core.text(g, '=cmd_check_success_1'),
      Core.text(g, '=cmd_check_success_2')
    )

    this.checkCooldown.push(mes.guild.id)
    setTimeout(() => {
      this.checkCooldown.splice(this.checkCooldown.indexOf(mes.guild.id), 1)
      this.checkCooldownHarsh.splice(this.checkCooldownHarsh.indexOf(mes.guild.id), 1)
    }, 10_000)
    return true
  }

}
