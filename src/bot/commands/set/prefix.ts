import { CommandHandler, GuildData, ReplyFunction, SettingsSubcommand } from "../../../types";
import { Core } from "../../../index";
import { Message } from "discord.js";


export default class SetPrefixHanler implements CommandHandler, SettingsSubcommand {

  public getMetaInfo(g: GuildData): [ string, string, any? ] {
    return null;
  }

  public handle(mes: Message, args: string[], g: GuildData, reply: ReplyFunction): boolean {
    reply(
      Core.text(g, '=cmd_change_prefix_1'),
      Core.text(g, '=cmd_change_prefix_2'),
    );
    return true;
  }

}