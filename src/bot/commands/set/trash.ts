import { CommandHandler, GuildData, ReplyFunction, SettingsSubcommand } from "../../../types";
import { Core } from "../../../index";
import { Message } from "discord.js";


export default class SetTrashHandler implements CommandHandler, SettingsSubcommand {

  public getMetaInfo(g: GuildData): [ string, string, any? ] {
    return [
      'trash ' + (g ? (g.trashGames ? 'on' : 'off') : 'off'),
      '=cmd_settings_change_trash'
    ];
  }

  public handle(mes: Message, args: string[], g: GuildData, reply: ReplyFunction): boolean {
    if (args.length < 1) {
      reply(
        Core.text(g, g.trashGames ? '=cmd_set_trash_status_on_1' : '=cmd_set_trash_status_off_1'),
        Core.text(g, g.trashGames ? '=cmd_set_trash_status_on_2' : '=cmd_set_trash_status_off_2')
      );
      return false;
    }
    if (['on', 'true', '1', 'yes'].includes(args[0].toLowerCase())) {
      if (!g.trashGames)
        Core.databaseManager.changeSetting(mes.guild, g, 'trash', 1);
      reply(
        Core.text(g, '=cmd_set_trash_success_on_1'),
        Core.text(g, '=cmd_set_trash_success_on_2')
      );
    } else if (['off', 'false', '0', 'no'].includes(args[0].toLowerCase())) {
      if (g.trashGames)
        Core.databaseManager.changeSetting(mes.guild, g, 'trash', 0);
      reply(
        Core.text(g, '=cmd_set_trash_success_off_1'),
        Core.text(g, '=cmd_set_trash_success_off_2')
      );
    } else {
      reply(
        Core.text(g, '=cmd_set_trash_not_found_1'),
        Core.text(g, '=cmd_set_trash_not_found_2', { text: args[0] })
      );
    }

    return true;
  }

}