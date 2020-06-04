import { Message } from "discord.js";
import { ReplyFunction, Command } from "../../types";
import { Core } from "../../index";


export default class HelpCommand extends Command {

  public constructor() {
    super({
      name: 'help',
      desc: 'Yes hello, service center here, how can I help you?',
      trigger: [ 'help', '?' ],
      hideOnHelp: true
    });
  }

  public handle(mes: Message, args: string[], repl: ReplyFunction): boolean {
    const cmdlist = Core.commandHandler.commands.filter(c => !c.info.hideOnHelp).map(c => `• \`@FreeStuff ${c.info.name}\` ─ ${c.info.desc}`);
    repl('Help is on the way!', '**Available commands:**\n\n' + cmdlist.join('\n\n'));
    return true;
  }

}