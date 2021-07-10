import { Message } from 'discord.js'
import { GuildData } from '../../types/datastructs'
import { Command, ReplyFunction } from '../../types/commands'
import { Core, config } from '../../index'
import Const from '../const'
// import NewFreeCommand from '../commands/free'


export default class ResendCommand extends Command {

  private testCooldown = [ ];
  private testCooldownHarsh = [ ];

  public constructor() {
    super({
      name: 'resend',
      desc: '=cmd_resend_desc',
      trigger: [ 'resend' ],
      hideOnHelp: true,
      serverManagerOnly: true
    })
  }

  public handle(mes: Message, _args: string[], g: GuildData, repl: ReplyFunction): boolean {
    if (this.testCooldownHarsh.includes(mes.guild.id))
      return true
    if (this.testCooldown.includes(mes.guild.id)) {
      repl(
        Core.text(g, '=cmd_on_cooldown_1'),
        Core.text(g, '=cmd_on_cooldown_2', { time: '30' })
      )
      this.testCooldownHarsh.push(mes.guild.id)
      return true
    }

    const freebies = [] // TODO NewFreeCommand.getCurrentFreebies()
    if (!freebies?.length) {
      repl(
        Core.text(g, '=cmd_resend_nothing_free_1'),
        Core.text(g, '=cmd_resend_nothing_free_2', { discordInvite: Const.links.supportInvite })
      )
      return
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
        && Const.themesWithEmbeds.includes(g.theme)) {
      repl(
        Core.text(g, '=cmd_test_noembeds_1'),
        Core.text(g, '=cmd_test_noembeds_2', { channel: g.channelInstance.toString() })
      )
      return true
    }
    if (!g.channelInstance.guild.me.permissionsIn(g.channelInstance).has('USE_EXTERNAL_EMOJIS')
        && Const.themesWithExtemotes[g.theme]) {
      repl(
        Core.text(g, '=cmd_test_extemotes_1'),
        Core.text(g, '=cmd_test_extemotes_2')
      )
      return true
    }

    try {
      Core.messageDistributor.sendToGuild(g, freebies, false, false)
      if (g.channelInstance.id !== mes.channel.id) {
        repl(
          Core.text(g, '=cmd_resend_success_1'),
          Core.text(g, '=cmd_resend_success_2', { channel: `<#${g.channelInstance.id}>` })
        )
      }
    } catch (ex) {
      repl(
        Core.text(g, '=cmd_error_fixable_1'),
        Core.text(g, '=cmd_error_fixable_2')
      )
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
