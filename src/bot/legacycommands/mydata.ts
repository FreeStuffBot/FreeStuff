import { Message } from 'discord.js'
import { GuildData } from '../../types/datastructs'
import { Command, ReplyFunction } from '../../types/commands'
import { Core } from '../../index'
import guildDataToViewString from '../../lib/guilddata-visualizer'
import Const from '../const'


export default class MydataCommand extends Command {

  private cmdCooldown = [ ]
  private cmdCooldownHarsh = [ ]

  public constructor() {
    super({
      name: 'mydata',
      desc: '=cmd_mydata_desc',
      trigger: [ 'mydata' ],
      hideOnHelp: true,
      serverManagerOnly: true
    })
  }

  public handle(mes: Message, args: string[], g: GuildData, repl: ReplyFunction): boolean {
    if (this.cmdCooldownHarsh.includes(mes.guild.id))
      return true
    if (this.cmdCooldown.includes(mes.guild.id)) {
      repl(
        Core.text(g, '=cmd_mydata_on_cooldown_1'),
        Core.text(g, '=cmd_mydata_on_cooldown_2')
      )

      this.cmdCooldownHarsh.push(mes.guild.id)
      setTimeout(() => {
        this.cmdCooldownHarsh.splice(this.cmdCooldownHarsh.indexOf(mes.guild.id), 1)
      }, 1000 * 60)

      return true
    }

    if (!args.length) {
      repl(
        Core.text(g, '=cmd_mydata_confirm_1'),
        Core.text(g, '=cmd_mydata_confirm_2')
      )
      return true
    }

    if (args[0].toLowerCase() !== 'confirm') {
      repl(
        Core.text(g, '=cmd_mydata_incorrect_confirmation_1'),
        Core.text(g, '=cmd_mydata_incorrect_confirmation_2')
      )
      return true
    }

    repl(
      Core.text(g, '=cmd_mydata_success_1'),
      this.fetchData(g)
    )

    this.cmdCooldown.push(mes.guild.id)
    setTimeout(() => {
      this.cmdCooldown.splice(this.cmdCooldown.indexOf(mes.guild.id), 1)
    }, 1000 * 60 * 60 * 24)

    return true
  }

  private fetchData(g: GuildData): string {
    const errormsg = Core.text(g, '=cmd_mydata_display_error', { invite: Const.links.supportInvite })
    const guilddata = guildDataToViewString(g, 2000, errormsg)
    const raw = { _id: g._id, sharder: g.sharder, channel: g.channel, role: g.role, settings: g.settings, filter: g.filter }
    return `**What we store:**\n\`\`\`${JSON.stringify(raw)}\`\`\`\n**Human readable**:\n${guilddata}`
  }

}
