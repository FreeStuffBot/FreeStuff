import { Message } from 'discord.js'
import { GuildData } from '../../../types/datastructs'
import { ReplyFunction, CommandHandler, SettingsSubcommand } from '../../../types/commands'
import { Core } from '../../../index'


export default class SetReactHandler implements CommandHandler, SettingsSubcommand {

  public getMetaInfo(_g: GuildData): [ string, string, any? ] {
    return [
      // 'reaction ' + (g ? (g.react ? 'on' : 'off') : 'off'),
      'reaction on/off',
      '=cmd_settings_change_reaction'
    ]
  }

  public handle(mes: Message, args: string[], g: GuildData, reply: ReplyFunction): boolean {
    if (args.length < 1) {
      reply(
        Core.text(g, g.react ? '=cmd_set_react_status_on_1' : '=cmd_set_react_status_off_1'),
        Core.text(g, g.react ? '=cmd_set_react_status_on_2' : '=cmd_set_react_status_off_2')
      )
      return false
    }
    if ([ 'on', 'true', '1' ].includes(args[0].toLowerCase())) {
      if (!g.react)
        Core.databaseManager.changeSetting(g, 'react', true)
      reply(
        Core.text(g, '=cmd_set_react_success_on_1'),
        Core.text(g, '=cmd_set_react_success_on_2')
      )
    } else if ([ 'off', 'false', '0' ].includes(args[0].toLowerCase())) {
      if (g.react)
        Core.databaseManager.changeSetting(g, 'react', false)
      reply(
        Core.text(g, '=cmd_set_react_success_off_1'),
        Core.text(g, '=cmd_set_react_success_off_2')
      )
    } else {
      reply(
        Core.text(g, '=cmd_set_react_not_found_1'),
        Core.text(g, '=cmd_set_react_not_found_2', { name: args[0] })
      )
    }

    return true
  }

}
