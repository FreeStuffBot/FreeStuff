import { Message } from "discord.js";
import { ReplyFunction, Command } from "../../types";
import { Core } from "../../index";


export default class HelpCommand extends Command {

  // const commandlist = [
  //   '`@FreeStuff help` - Shows this help page',
  //   '`@FreeStuff about` - Shows some info about the bot',
  //   '`@FreeStuff set` - Change the settings',
  //   '`@FreeStuff test` - Run a test announcement to see if you\'ve set up everything correctly',
  //   '`@FreeStuff invite` - Get an invite link to add this bot to your server',
  //   '`@FreeStuff vote` - Enjoying the service? Give me an upvote on top.gg!',
  // ];

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