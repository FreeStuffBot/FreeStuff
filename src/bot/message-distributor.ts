import { FreeStuffBot, Core } from "../index";
import { Message, Guild, MessageOptions } from "discord.js";
import Const from "./const";
import Database from "../database/database";
import { GameInfo, GuildData, GameData, DatabaseGuildData, GameFlag, Theme } from "../types";
import { Long } from "mongodb";
import { DbStats } from "../database/db-stats";
import ThemeOne from "./themes/1";
import ThemeTwo from "./themes/2";
import ThemeThree from "./themes/3";
import ThemeFour from "./themes/4";
import ThemeFive from "./themes/5";
import ThemeSix from "./themes/6";
import ThemeSeven from "./themes/7";
import ThemeEight from "./themes/8";
import ThemeNine from "./themes/9";


export default class MessageDistributor {

  private readonly themes: Theme[] = [
    new ThemeOne(),
    new ThemeTwo(),
    new ThemeThree(),
    new ThemeFour(),
    new ThemeFive(),
    new ThemeSix(),
    new ThemeSeven(),
    new ThemeEight(),
    new ThemeNine(),
  ];

  //

  public constructor(bot: FreeStuffBot) { }

  //

  public async distribute(content: GameInfo, announcementId: number) {
    if (content.type != 'free') return; // TODO

    const guilds: DatabaseGuildData[] = await Database
      .collection('guilds')
      .find(
        Core.singleShard
          ? { channel: { $ne: null } }
          : { sharder: { $mod: [Core.options.shardCount, Core.options.shardId] },
              channel: { $ne: null } }
      )
      .toArray();
    if (!guilds) return;

    console.log(`Starting to announce ${content.title} - ${new Date().toLocaleTimeString()}`);
    let announcementsMade = 0;
    for (const g of guilds) {
      if (!g) return;
      try {
        const successful = this.sendToGuild(g, content, false, false);
        if (await successful) {
          await new Promise(res => setTimeout(() => res(), 200));
          announcementsMade++;
        }
      } catch(ex) { console.error(ex); }
    }
    console.log(`Done announcing ${content.title} - ${new Date().toLocaleTimeString()}`);

    (await DbStats.usage).announcements.updateToday(announcementsMade, true);
    if (announcementId >= 0) {
      Database
        .collection('games')
        .updateOne(
          { _id: announcementId },
          { '$inc': { 'analytics.reach': announcementsMade } }
        );
    }
  }

  public test(guild: Guild, content: GameInfo): void {
    Database
      .collection('guilds')
      .findOne({ _id: Long.fromString(guild.id) })
      .then((g: DatabaseGuildData) => {
        if (!g) return;
        this.sendToGuild(g, content, true, true);
      })
      .catch(console.error);
  }

  public async sendToGuild(g: DatabaseGuildData, content: GameInfo, test: boolean, force: boolean): Promise<boolean> {
    const data = Core.databaseManager.parseGuildData(g);
    if (!data) return false;

    // forced will ignore filter settings
    if (!force) {
      if (data.price > content.org_price[data.currency == 'euro' ? 'euro' : 'dollar']) return false;
      if (!!content.flags?.includes(GameFlag.TRASH) && !data.trashGames) return false;
    }

    // check if channel is valid
    if (!data.channelInstance) return false;
    if (!data.channelInstance.send) return false;
    if (!data.channelInstance.guild.available) return false;

    // check if permissions match
    const self = data.channelInstance.guild.me;
    if (!self.permissionsIn(data.channelInstance).has('SEND_MESSAGES')) return false;
    if (!self.permissionsIn(data.channelInstance).has('VIEW_CHANNEL')) return false;
    if (!self.permissionsIn(data.channelInstance).has('EMBED_LINKS')
       && Const.themesWithEmbeds.includes(data.theme)) return false;
    if (!self.permissionsIn(data.channelInstance).has('EXTERNAL_EMOJIS')
       && Const.themesWithExtemotes[data.theme]) data.theme = Const.themesWithExtemotes[data.theme];

    // set content url
    if (!content.url) content.url = content.org_url;

    // build message object
    const messageContent = this.buildMessage(content, data, test);
    if (!messageContent) return false;

    // send the message
    const mes: Message = await data.channelInstance.send(...messageContent) as Message;
    if (data.react && self.permissionsIn(data.channelInstance).has('ADD_REACTIONS'))
      await mes.react('🆓');
    return true;
  }

  public buildMessage(content: GameInfo, data: GuildData, test: boolean): (string | MessageOptions)[] {
    const theme = this.themes[data.theme];
    if (!theme) return undefined;
    return theme.build(content, data, test);
  }

}
