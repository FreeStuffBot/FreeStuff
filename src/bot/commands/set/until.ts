import { Message } from 'discord.js'
import { CommandHandler, GuildData, ReplyFunction, SettingsSubcommand } from '../../../types'
import { Core } from '../../../index'


export default class SetUntilHandler implements CommandHandler, SettingsSubcommand {

  public getMetaInfo(_g: GuildData): [ string, string, any? ] {
    return [
      // 'until ' + (g ? (g.altDateFormat ? 'date' : 'weekday') : 'weekday'),
      'until date/weekday',
      '=cmd_settings_change_until'
    ]
  }

  public handle(mes: Message, args: string[], g: GuildData, reply: ReplyFunction): boolean {
    if (args.length < 1) {
      reply(
        Core.text(g, g.altDateFormat ? '=cmd_set_until_weekday_status_1' : '=cmd_set_until_date_status_1'),
        Core.text(g, g.altDateFormat ? '=cmd_set_until_weekday_status_2' : '=cmd_set_until_date_status_2')
      )
      return false
    }

    if ([ 'day', 'name', 'week', 'weekday' ].includes(args[0].toLowerCase())) {
      if (!g.altDateFormat)
        Core.databaseManager.changeSetting(mes.guild, g, 'altdate', 1)
      reply(
        Core.text(g, '=cmd_set_until_weekday_success_1'),
        Core.text(g, '=cmd_set_until_weekday_success_2')
      )
    } else if ([ 'date', 'time' ].includes(args[0].toLowerCase())) {
      if (g.altDateFormat)
        Core.databaseManager.changeSetting(mes.guild, g, 'altdate', 0)
      reply(
        Core.text(g, '=cmd_set_until_date_success_1'),
        Core.text(g, '=cmd_set_until_date_success_2')
      )
    } else {
      reply(
        Core.text(g, '=cmd_set_until_not_found_1'),
        Core.text(g, '=cmd_set_until_not_found_2', { text: args[0] })
      )
    }

    return true
  }

}
