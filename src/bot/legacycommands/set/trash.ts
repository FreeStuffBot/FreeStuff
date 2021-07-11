import { Message } from 'discord.js'
import { GuildData } from '../../../types/datastructs'
import { ReplyFunction, CommandHandler, SettingsSubcommand } from '../../../types/commands'
import { Core } from '../../../index'


export default class SetTrashHandler implements CommandHandler, SettingsSubcommand {

  public getMetaInfo(_g: GuildData): [ string, string, any? ] {
    return [
      // 'trash ' + (g ? (g.trashGames ? 'on' : 'off') : 'off'),
      'trash on/off',
      '=cmd_settings_change_trash'
    ]
  }

  public handle(mes: Message, args: string[], g: GuildData, reply: ReplyFunction): boolean {
    if (args.length < 1) {
      reply(
        Core.text(g, g.trashGames ? '=cmd_set_trash_status_on_1' : '=cmd_set_trash_status_off_1'),
        Core.text(g, g.trashGames ? '=cmd_set_trash_status_on_2' : '=cmd_set_trash_status_off_2')
      )
      return false
    }
    if ([ 'on', 'true', '1', 'yes' ].includes(args[0].toLowerCase())) {
      if (!g.trashGames)
        Core.databaseManager.changeSetting(mes.guild, g, 'trash', true)
      reply(
        Core.text(g, '=cmd_set_trash_success_on_1'),
        Core.text(g, '=cmd_set_trash_success_on_2')
      )
    } else if ([ 'off', 'false', '0', 'no' ].includes(args[0].toLowerCase())) {
      if (g.trashGames)
        Core.databaseManager.changeSetting(mes.guild, g, 'trash', false)
      reply(
        Core.text(g, '=cmd_set_trash_success_off_1'),
        Core.text(g, '=cmd_set_trash_success_off_2')
      )
    } else {
      reply(
        Core.text(g, '=cmd_set_trash_not_found_1'),
        Core.text(g, '=cmd_set_trash_not_found_2', { text: args[0] })
      )
    }

    return true
  }

}
