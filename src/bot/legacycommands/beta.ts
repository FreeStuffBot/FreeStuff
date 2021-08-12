import { Message } from 'discord.js'
import { GuildData } from '../../types/datastructs'
import { Command, ReplyFunction } from '../../types/commands'
import { Core } from '../../index'
import DatabaseManager from '../database-manager'


export default class BetaCommand extends Command {

  public constructor() {
    super({
      name: 'beta',
      desc: '=cmd_beta_desc',
      trigger: [ 'beta' ],
      hideOnHelp: true,
      serverManagerOnly: true
    })
  }

  public handle(_mes: Message, args: string[], g: GuildData, reply: ReplyFunction): boolean {
    if (args.length < 1) {
      reply(
        Core.text(g, g.beta ? '=cmd_beta_info_enabled_1' : '=cmd_beta_info_disabled_1'),
        Core.text(g, g.beta ? '=cmd_beta_info_enabled_2' : '=cmd_beta_info_disabled_2')
      )
      return true
    }
    if ([ 'on', 'true', '1', 'yes', 'enable' ].includes(args[0].toLowerCase())) {
      if (!g.beta)
        DatabaseManager.changeSetting(g, 'beta', true)
      reply(
        Core.text(g, '=cmd_beta_opt_in_1'),
        Core.text(g, '=cmd_beta_opt_in_2')
      )
    } else if ([ 'off', 'false', '0', 'no', 'disable' ].includes(args[0].toLowerCase())) {
      if (g.beta)
        DatabaseManager.changeSetting(g, 'beta', false)
      reply(
        Core.text(g, '=cmd_beta_opt_out_1'),
        Core.text(g, '=cmd_beta_opt_out_2')
      )
    } else {
      reply(
        Core.text(g, '=cmd_beta_invalid_response_1'),
        Core.text(g, '=cmd_beta_invalid_response_2', { text: args[0] })
      )
    }

    return true
  }

}
