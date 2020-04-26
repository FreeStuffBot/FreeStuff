import { FreeStuffBot, Core } from "../index";
import { GameData } from "types";
import Database from "../database/database";


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
            if (!this.announcementQueue.find(i => i._id == entry._id)) {
              // entry.info.url = this.generateProxyUrl(entry);
              entry.info.url = entry.info.org_url;
              this.announcementQueue.push(entry);
            }
          }

          if (this.announcementQueue.length)
            this.nextAnnouncement();
        })
        .catch(() => {});
    }, 1000 * 60);
  }

  public generateProxyUrl(content: GameData): string {
    return `https://game.freestuffbot.xyz/${content._id}/${content.info.title.split(/\s/).join('-').split(/[^A-Za-z0-9\-]/).join('')}`;
  }

  public async nextAnnouncement() {
    if (!this.announcementQueue.length) return;
    const announcement = this.announcementQueue.splice(0, 1)[0];
    this.currentlyAnnouncing = true;
    Database
      .collection('games')
      .updateOne({ _id: announcement._id }, {
        '$set': {
          status: 'published',
          published: Math.ceil(Date.now() / 1000),
        }
      });
    await Core.messageDistributor.distribute(announcement.info);
    this.currentlyAnnouncing = false;
  }

}