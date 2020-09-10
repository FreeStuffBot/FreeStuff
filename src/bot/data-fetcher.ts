import { FreeStuffBot, Core } from "../index";
import { GameData } from "types";
import Database from "../database/database";
import FreeCommand from "./commands/free";
import Redis from "../database/redis";


export default class DataFetcher {

  public readonly announcementQueue: GameData[] = [];

  public currentlyAnnouncing = false;

  public constructor(bot: FreeStuffBot) {
    const checkInterval = bot.devMode ? 5 : 60;

    bot.on('ready', () => {
      setInterval(async () => {
        if (this.currentlyAnnouncing) return;
  
        const pending = await Redis.getSharded('pending');
        if (pending) {
          this.finishAnnouncement(parseInt(pending, 10));
        } else {
          this.checkMongoQueue();
        }
      }, checkInterval * 1000);
    });
  }

  private async checkMongoQueue() {
    const waiting: GameData[] = await Database
      .collection('games')
      .find({ status: 'accepted' })
      .toArray()
    
    if (!waiting || !waiting.length) return;
    for (const entry of waiting) {
      if (!!this.announcementQueue.find(i => i._id == entry._id)) continue;
      if (!Core.singleShard && entry.outgoing && entry.outgoing.includes(Core.options.shards[0])) continue;

      // entry.info.url = this.generateProxyUrl(entry);
      entry.info.url = entry.info.org_url;
      this.announcementQueue.push(entry);
    }

    if (this.announcementQueue.length)
      this.nextAnnouncement();
  }

  private async finishAnnouncement(id: number) {
    const game: GameData = await Database
      .collection('games')
      .findOne({ _id: id });
    if (!game) {
      Redis.setSharded('pending', '');
      return;
    }

    this.announcementQueue.push(game);
    this.nextAnnouncement();
  }

  /**
   * The page proxy is currently not used
   * @param content game data
   */
  public generateProxyUrl(content: GameData): string {
    return `https://game.freestuffbot.xyz/${content._id}/${content.info.title.split(/\s/).join('-').split(/[^A-Za-z0-9\-]/).join('')}`;
  }

  public async nextAnnouncement() {
    if (!this.announcementQueue.length) return;
    this.currentlyAnnouncing = true;
    const announcement = this.announcementQueue.splice(0, 1)[0];
    Redis.setSharded('pending', announcement._id + '');

    if (!Core.singleShard && announcement.status == 'accepted') {
      Database
        .collection('games')
        .updateOne({ _id: announcement._id }, {
          '$push': { outgoing: Core.options.shards[0] }
        });
    }

    await Core.messageDistributor.distribute(announcement.info, announcement._id);

    this.currentlyAnnouncing = false;
    Redis.setSharded('pending', '');

    Database
      .collection('games')
      .findOne({ _id: announcement._id })
      .then((game: GameData) => {
        if (!Core.singleShard) {
          if (!game.outgoing) return;
          if (game.outgoing.length < Core.options.shardCount) return;
        }
        if (game.status != 'accepted') return;

        Database
          .collection('games')
          .updateOne({ _id: announcement._id }, {
            '$set': {
              status: 'published',
              published: Math.ceil(Date.now() / 1000)
            },
            '$unset': {
              outgoing: null
            }
          });
          
        FreeCommand.updateCurrentFreebies();
      })
      .catch(() => {});
  }

}
