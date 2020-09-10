import { Message } from "discord.js";
import { ReplyFunction, Command, GuildData } from "../../types";
import Const from "../const";
import { Core } from "../../index";
import { Console } from "console";


export default class ResetCommand extends Command {

  public constructor() {
    super({
      name: 'reset',
      desc: '=cmd_reset_desc',
      trigger: [ 'reset', 'deletedata' ],
      hideOnHelp: true
    });
  }

  public async handle(mes: Message, args: string[], g: GuildData, repl: ReplyFunction): Promise<boolean> {
    if (!args.length) {
      repl(
        Core.text(g, '=cmd_reset_confirm_1'),
        Core.text(g, '=cmd_reset_confirm_2')
      );
      return true;
    }

    if (args[0].toLowerCase() != 'confirm') {
      repl(
        Core.text(g, '=cmd_reset_incorrect_confirmation_1'),
        Core.text(g, '=cmd_reset_incorrect_confirmation_2')
      );
      return true;
    }

    await Core.databaseManager.removeGuild(g._id);
    await Core.databaseManager.addGuild(mes.guild);
    
    repl(
      Core.text(g, '=cmd_reset_success_1'),
      Core.text(g, '=cmd_reset_success_2')
    );

    return true;
  }

}