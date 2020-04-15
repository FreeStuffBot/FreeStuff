import { Message } from "discord.js";
import { ReplyFunction, Command } from "../../types";
import Const from "../const";


export default class VoteCommand extends Command {

  public constructor() {
    super({
      name: 'vote',
      desc: 'Enjoying the service? Give me an upvote on top.gg!',
      trigger: [ 'vote', 'topgg', 'top', 'botlist', 'v' ]
    });
  }

  public handle(mes: Message, args: string[], repl: ReplyFunction): boolean {
    repl('Enjoing the free games?', `[Click here to upvote me on top.gg!](${Const.topGGLink})`);
    return true;
  }

}