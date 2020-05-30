import { Message } from "discord.js";
import { ReplyFunction, Command, GameInfo, GameData } from "../../types";
import Database from "../../database/database";
import SentryManager from "../../thirdparty/sentry/sentry";
import Const from "../const";
import { Core } from "../../index";
import { CronJob } from "cron";


export default class FreeCommand extends Command {

  public constructor() {
    super({
      name: 'free',
      desc: 'Want to know which games are currenlty free? Do this.',
      trigger: [ 'free', 'currenlty', 'current', 'what', 'whats', 'what\'s', 'what´s', 'what`s' ]
    });

    setInterval(() => {
      FreeCommand.updateCurrentFreebies();
    }, 1000 * 60 * 60 * 1);
    FreeCommand.updateCurrentFreebies();
  }

  public handle(mes: Message, args: string[], repl: ReplyFunction): boolean {
    const cont = mes.content.toLowerCase();
    if (cont.startsWith('what')) {
      if (!cont.match(/what.? ?i?s? +(currently)? ?free/)) return;
    }

    Core.databaseManager.getGuildData(mes.guild).then(d => {
      const freeLonger: string[] = [];
      const freeToday: string[] = [];
      for (const game of FreeCommand.current) {
        const str = `${Const.storeEmojis[game.store] || ':gray_question:'} **[${game.title}](${game.org_url})**\n${Const.bigSpace} ~~${d.currency == 'euro' ? `${game.org_price.euro}€` : `$${game.org_price.dollar}`}~~ • until ${(game['_ends'] as Date).toLocaleDateString('en-GB')}\n`;
        if (game['_today']) freeToday.push(str);
        else freeLonger.push(str);
      }
      
      let replyText = `${freeLonger.join('\n')}`;
      if (freeToday.length) replyText += `\n\n**Ends soon:** (or possibly already has ended)\n\n${freeToday.join('\n')}`;
      repl(`These games are currently free:`, replyText);
    });
    return true;
  }

  private static current: GameInfo[] = undefined;

  public static updateCurrentFreebies() {
    Database
      .collection('games')
      .find({ status: 'published' })
      .sort({ published: -1 })
      .limit(20)
      .toArray()
      .then((games: GameData[]) => {
        const out: GameInfo[] = [];
        const currentStamp = Math.ceil(Date.now() / 1000);
        for (const game of games) {
          const delta = parseInt(game.info.until + '') * 24 * 60 * 60;
          if (game.published + delta > currentStamp) {
            if (game.published + delta - currentStamp < 24 * 60 * 60) 
              game.info['_today'] = true;
            game.info['_ends'] = new Date((game.published + delta) * 1000);
            out.push(game.info);
          }
        }
        FreeCommand.current = out;
      })
      .catch(err => {
        this.current = null;
        SentryManager.report(err);
      });
  }

}