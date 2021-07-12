import { Message } from 'discord.js'
import { GuildData } from '../../../types/datastructs'
import { ReplyFunction, CommandHandler, SettingsSubcommand } from '../../../types/commands'
import { Core } from '../../../index'
import Const from '../../const'


export default class SetThemeHandler implements CommandHandler, SettingsSubcommand {

  public getMetaInfo(_g: GuildData): [ string, string, any? ] {
    return [
      // 'theme ' + (g ? (g.theme + 1) : 1),
      'theme',
      '=cmd_settings_change_theme',
      { themeListLink: Const.links.themes }
    ]
  }

  public handle(mes: Message, args: string[], g: GuildData, reply: ReplyFunction): boolean {
    if (args.length < 1) {
      reply(
        Core.text(g, '=cmd_set_theme_missing_args_1'),
        Core.text(g, '=cmd_set_theme_missing_args_2', { themeListLink: Const.links.themes })
      )
      return false
    }
    if ([ '1', '2', '3', '4', '5', '6', '7', '8', '9', '10' ].includes(args[0])) {
      Core.databaseManager.changeSetting(g, 'theme', parseInt(args[0], 10) - 1)
      reply(
        Core.text(g, '=cmd_set_theme_success_1'),
        Core.text(g, '=cmd_set_theme_success_2')
      )
    } else {
      reply(
        Core.text(g, '=cmd_set_theme_not_found_1'),
        Core.text(g, '=cmd_set_theme_not_found_2', {
          name: args[0],
          themeListLink: Const.links.themes
        })
      )
    }

    return true
  }

}
