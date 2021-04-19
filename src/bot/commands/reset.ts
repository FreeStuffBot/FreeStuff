import { Message } from 'discord.js'
import { ReplyFunction, Command, GuildData } from '../../types'
import Const from '../const'
import { Core } from '../../index'


export default class ResetCommand extends Command {

  private cmdCooldown = [ ];
  private cmdCooldownHarsh = [ ];

  public constructor() {
    super({
      name: 'reset',
      desc: '=cmd_reset_desc',
      trigger: [ 'reset', 'deletedata' ],
      hideOnHelp: true,
      serverManagerOnly: true
    })
  }

  public async handle(mes: Message, args: string[], g: GuildData, repl: ReplyFunction): Promise<boolean> {
    if (this.cmdCooldownHarsh.includes(mes.guild.id))
      return true
    if (this.cmdCooldown.includes(mes.guild.id)) {
      repl(
        Core.text(g, '=cmd_reset_on_cooldown_1'),
        Core.text(g, '=cmd_reset_on_cooldown_2')
      )

      this.cmdCooldownHarsh.push(mes.guild.id)
      setTimeout(() => {
        this.cmdCooldownHarsh.splice(this.cmdCooldownHarsh.indexOf(mes.guild.id), 1)
      }, 1000 * 60)

      return true
    }

    if (!args.length) {
      repl(
        Core.text(g, '=cmd_reset_confirm_1'),
        Core.text(g, '=cmd_reset_confirm_2', { invite: Const.links.supportInvite })
      )
      return true
    }

    if (args[0].toLowerCase() !== 'confirm') {
      repl(
        Core.text(g, '=cmd_reset_incorrect_confirmation_1'),
        Core.text(g, '=cmd_reset_incorrect_confirmation_2')
      )
      return true
    }

    await Core.databaseManager.removeGuild(g._id)
    await Core.databaseManager.addGuild(mes.guild)

    repl(
      Core.text(g, '=cmd_reset_success_1'),
      Core.text(g, '=cmd_reset_success_2')
    )

    this.cmdCooldown.push(mes.guild.id)
    setTimeout(() => {
      this.cmdCooldown.splice(this.cmdCooldown.indexOf(mes.guild.id), 1)
    }, 1000 * 60 * 60 * 24)

    return true
  }

}
