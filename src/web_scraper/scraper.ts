
import { FreeStuffData } from 'types';
import EpicGamesScraper from './epicgames.scraper';
import ScraperWorker from './worker';



export default class WebScraper {

  private constructor() { }

  //

  private static scraper: { [storename: string]: ScraperWorker } = undefined;

  static init() {
    WebScraper.scraper = {
      'epic-games': new EpicGamesScraper(),
      'steam': undefined,
      'gog': undefined,
    }
  }

  public static async fetch(url: string): Promise<FreeStuffData> {
    let store: '' | 'epic-games' | 'steam' | 'gog' = '';

    if (/^https?:\/\/(www\.)?epicgames\.com\/store\/.*$/.test(url))
      store = 'epic-games';

    console.log(store);

    if (!store) return;
    return await this.scraper[store].fetch(url);
  }

}