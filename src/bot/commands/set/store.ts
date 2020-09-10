import { CommandHandler, GuildData, ReplyFunction, SettingsSubcommand } from "../../../types";
import { Core } from "../../../index";
import { Message } from "discord.js";


export default class SetStoreHandler implements CommandHandler, SettingsSubcommand {

  public getMetaInfo(g: GuildData): [ string, string, any? ] {
    return [
      'channel #' + ((g && g.channelInstance) ? g.channelInstance.name : 'channel'),
      '=cmd_settings_change_channel'
    ];
  }

  public handle(mes: Message, args: string[], g: GuildData, reply: ReplyFunction): boolean {
    if (args.length < 1) {
      reply(
        Core.text(g, '=cmd_set_store_missing_args_1'),
        Core.text(g, '=cmd_set_store_missing_args_2')
      );
      return false;
    }

    let store = args[0].toLowerCase();
    if (store.endsWith('game')) store = store.substr(0, store.length - 4);
    if (store.endsWith('games')) store = store.substr(0, store.length - 5);
    

    // if (args.length < 2) {
    //   reply(
    //     Core.text(g, on ? '=cmd_set_store_status_on_1' : '=cmd_set_store_status_off_1', { store: 'STEAM' }),
    //     Core.text(g, on ? '=cmd_set_store_status_on_2' : '=cmd_set_store_status_off_2', { store: 'STEAM' })
    //   );
    //   return false;
    // }

    return true;
  }

}