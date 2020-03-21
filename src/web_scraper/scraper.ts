
import { FreeStuffData } from 'types';
import EpicGamesScraper from './epicgames.scraper';
import ScraperWorker from './worker';
import SteamScraper from './steam.scraper';



export default class WebScraper {

  private constructor() { }

  //

  private static scraper: { [storename: string]: ScraperWorker } = undefined;

  static init() {
    WebScraper.scraper = {
      'epic-games': new EpicGamesScraper(),
      'steam': new SteamScraper(),
      'gog': undefined,
    }
  }

  public static async fetch(url: string): Promise<FreeStuffData> {
    let store: '' | 'epic-games' | 'steam' | 'gog' = '';

    if (/^https?:\/\/(www\.)?epicgames\.com\/store\/.*$/.test(url))
      store = 'epic-games';
    if (/^https?:\/\/store.steampowered\.com\/app\/.*$/.test(url))
      store = 'steam';

    console.log(store);

    if (!store) return;
    return await this.scraper[store].fetch(url);
  }

}