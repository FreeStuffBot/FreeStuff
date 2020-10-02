import { FreeStuffBot, Core } from "../index";
import FreeCommand from "./commands/free";
import Redis from "../database/redis";
import { Semaphore } from 'await-semaphore';


export default class AnnouncementManager {

  public currentlyAnnouncing = false;
  private semaphore: Semaphore;

  public constructor(bot: FreeStuffBot) {
    const checkInterval = bot.devMode ? 5 : 60;
    this.semaphore = new Semaphore(1);

    Core.fsapi.on('free_games', async (ids) => {
      const release = await this.semaphore.acquire();
      let pending = await Redis.getSharded('pending');

      if (pending) pending += ' ' + ids.join(' ');
      else pending = ids.join(' ');

      await Redis.setSharded('pending', pending);
      release();
    });

    bot.on('ready', () => {
      setInterval(() => this.checkQueue(), checkInterval * 1000);
    });
  }

  private async checkQueue() {
    if (this.currentlyAnnouncing) return;
    const release = await this.semaphore.acquire();

    const pending = await Redis.getSharded('pending');
    if (pending) {
      release();
      this.announce(pending);
      return;
    }

    const queue = await Redis.getSharded('queue');
    if (queue) {
      await Redis.setSharded('queue', '');
      release();
      this.announce(queue);
      return;
    }

    release();
  }

  public async setQueue(value: string) {
    const release = await this.semaphore.acquire();
    await Redis.setSharded('queue', value);
    release();
  }

  public async setPending(value: string) {
    const release = await this.semaphore.acquire();
    await Redis.setSharded('pending', value);
    release();
  }

  private async announce(gameids: string) {
    this.setPending(gameids);

    FreeCommand.updateCurrentFreebies();

    this.currentlyAnnouncing = true;

    const numberIds = gameids.split(' ').map(id => parseInt(id));
    const gameInfos = await Core.fsapi.getGameDetails(numberIds, 'info');
    await Core.messageDistributor.distribute(Object.values(gameInfos));

    Redis.setSharded('pending', '');
    this.currentlyAnnouncing = false;
  }

}
