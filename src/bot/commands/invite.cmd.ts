import { Message } from "discord.js";
import { ReplyFunction, Command } from "../../types";
import Const from "../const";


export default class InviteCommand extends Command {

  public constructor() {
    super({
      name: 'invite',
      desc: 'Get an invite link to add the bot to your own server!',
      trigger: [ 'get', 'link', 'invite', 'add', 'join' ]
    });
  }

  public handle(mes: Message, args: string[], repl: ReplyFunction): boolean {
    repl(':eyes:', `[Click here to add me to your server!](${Const.inviteLink})`);
    return true;
  }

}