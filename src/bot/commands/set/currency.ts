import { Message } from 'discord.js'
import { CommandHandler, GuildData, ReplyFunction, SettingsSubcommand } from '../../../types'
import { Core } from '../../../index'


export default class SetCurrencyHandler implements CommandHandler, SettingsSubcommand {

  public getMetaInfo(_g: GuildData): [ string, string, any? ] {
    return [
      // 'currency ' + (g ? (g.currency == 'euro' ? '€' : '$') : '€'),
      'currency €/$',
      '=cmd_settings_change_currency'
    ]
  }

  public handle(mes: Message, args: string[], g: GuildData, reply: ReplyFunction): boolean {
    if (args.length < 1) {
      reply(
        Core.text(g, '=cmd_set_currency_missing_args_1'),
        Core.text(g, '=cmd_set_currency_missing_args_2')
      )
      return false
    }
    if ([ '€', 'euro', 'eur' ].includes(args[0].toLowerCase())) {
      if (g.currency !== 'euro')
        Core.databaseManager.changeSetting(mes.guild, g, 'currency', 0)
      reply(
        Core.text(g, '=cmd_set_currency_success_euro_1'),
        Core.text(g, '=cmd_set_currency_success_euro_2')
      )
    } else if ([ '$', 'dollar', 'usd' ].includes(args[0].toLowerCase())) {
      if (g.currency !== 'usd')
        Core.databaseManager.changeSetting(mes.guild, g, 'currency', 1)
      reply(
        Core.text(g, '=cmd_set_currency_success_dollar_1'),
        Core.text(g, '=cmd_set_currency_success_dollar_2')
      )
    } else {
      reply(
        Core.text(g, '=cmd_set_currency_not_found_1', { name: args[0] }),
        Core.text(g, '=cmd_set_currency_not_found_2')
      )
    }

    return true
  }

}
