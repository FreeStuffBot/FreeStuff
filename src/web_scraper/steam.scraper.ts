import { FreeStuffData } from "types";
import * as puppeteer from "puppeteer";
import ScraperWorker from "./worker";


// TODO this is not working
export default class SteamScraper extends ScraperWorker {

  private queries = {
    price: '.discount_original_price',
    title: '.apphub_AppName',
    image: '.game_header_image_full',
  }

  public async fetch(url: string): Promise<FreeStuffData> {
    let browser = await puppeteer.launch();
    let page = await browser.newPage();
    await page.goto(url);
    await page.waitFor(5000);
    await page.screenshot({path: 'example.png'});

    let price = await this.grabInfo(page, this.queries.price, '9.99 €');
    let priceEur = parseFloat(price.substring(0, price.length - 2).split(',').join('.'));
    let priceUsd = priceEur; //Math.ceil(priceEur * 1.09) - .01;

    let title = await this.grabInfo(page, this.queries.title, 'Unknown');

    let image = await page.evaluate(el => console.log(el), await page.$(this.queries.image)[0]);

    browser.close();
    return {
      store: 'Steam',
      thumbnail: undefined,
      title: title,
      url: url,
      org_price: {
        euro: priceEur,
        dollar: priceUsd
      },
      trash: false
    };
  }

  private async grabInfo(page: puppeteer.Page, query: string, defval: string): Promise<string> {
    try {
      let el = await page.$(query)[0];
      return await page.evaluate(el => el.textContent, el);
    } catch (ex) {
      return defval;
    }
  }

}