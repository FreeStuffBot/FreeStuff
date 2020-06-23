import { FreeStuffBot, Core } from "../index";
import { GameData, DatabaseGuildData } from "types";
import Database from "../database/database";
import FreeCommand from "./commands/free";


export default class DataFetcher {

  public readonly announcementQueue: GameData[] = [];

  public currentlyAnnouncing = false;

  public constructor(bot: FreeStuffBot) {
    setInterval(() => {
      if (this.currentlyAnnouncing) return;

      Database
        .collection('games')
        .find({ status: 'accepted' })
        .toArray()
        .then((waiting: GameData[]) => {
          if (!waiting || !waiting.length) return;
          for (const entry of waiting) {
            if (!!this.announcementQueue.find(i => i._id == entry._id)) continue;
            if (!Core.singleShard && entry.outgoing && entry.outgoing.includes(Core.options.shardId)) continue;

            // entry.info.url = this.generateProxyUrl(entry);
            entry.info.url = entry.info.org_url;
            this.announcementQueue.push(entry);
          }

          if (this.announcementQueue.length)
            this.nextAnnouncement();
        })
        .catch(() => {});
    }, 1000 * 60);
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
    if (!Core.singleShard) Database
      .collection('games')
      .updateOne({ _id: announcement._id }, {
        '$push': { outgoing: Core.options.shardId }
      });
    await Core.messageDistributor.distribute(announcement.info, announcement._id);
    this.currentlyAnnouncing = false;
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
