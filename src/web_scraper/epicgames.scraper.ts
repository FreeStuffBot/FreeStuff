import { FreeStuffData } from "types";
import * as puppeteer from "puppeteer";
import ScraperWorker from "./worker";


export default class EpicGamesScraper extends ScraperWorker {

  private queries = {
    // price: "#dieselReactWrapper > div > div.WebApp-webApp_e9fb876f.contentGridPosition > div.ProductDetails-wrapper_c97c40cc.contentGridPosition.ProductDetails-marginTopForTopNav_fe34af09.storeSpacingTop > div > div.ProductDetailHeader-wrapper_9de162b7 > div.Description-container_b614d543.ProductDetails-description_1783a42e.gridContentWrapper > div.Description-ctaWrapper_426190ef > div > div > div.PurchaseButton-priceWrapper_3a228d59 > div > div > s",
    // title: "#dieselReactWrapper > div > div.WebApp-webApp_e9fb876f.contentGridPosition > div.ProductDetails-wrapper_c97c40cc.contentGridPosition.ProductDetails-marginTopForTopNav_fe34af09.storeSpacingTop > div > div.ProductDetails-contentTopWrapper_bd8ef381.gridContentWrapper > div > div > div > ul > li:nth-child(2) > a > span",
    // logo: "#dieselReactWrapper > div > div.WebApp-webApp_e9fb876f.contentGridPosition > div.ProductDetails-wrapper_c97c40cc.contentGridPosition.ProductDetails-marginTopForTopNav_fe34af09.storeSpacingTop > div > div.ProductDetailHeader-wrapper_9de162b7 > div.Description-container_b614d543.ProductDetails-description_1783a42e.gridContentWrapper > div.Description-logoContainer_170d205a > div",
    price: '//*[@id="dieselReactWrapper"]/div/div[4]/div[3]/div/div[2]/div[2]/div[3]/div/div/div[1]/div/div/s',
    title: '//*[@id="dieselReactWrapper"]/div/div[4]/div[3]/div/div[1]/div/div/div/ul/li[2]/a',
    logo: '//*[@id="dieselReactWrapper"]/div/div[4]/div[3]/div/div[2]/div[2]/div[1]/div',

    agerestrButton: '//*[@id="dieselReactWrapper"]/div/div[4]/div[4]/div/div[2]/div/button',
  }

  public async fetch(url: string): Promise<FreeStuffData> {
    let browser = await puppeteer.launch();
    let page = await browser.newPage();
    await page.goto(url);
    await page.waitFor(5000);
    await page.screenshot({path: 'example.png'});
    
    let agerestrButton = await this.grabInfo(page, this.queries.agerestrButton + '/span', undefined);
    console.log(agerestrButton);
    if (agerestrButton) {
      let buttons = await page.$x(this.queries.agerestrButton);
      buttons[0].click();
      page.waitFor(5000);
    }
    await page.screenshot({path: 'example.png'});

    let price = await this.grabInfo(page, this.queries.price, '9.99 €');
    let priceEur = parseFloat(price.substring(0, price.length - 2).split(',').join('.'));
    let priceUsd = Math.ceil(priceEur * 1.09) - .01;

    let title = await this.grabInfo(page, this.queries.title, 'Unknown');

    let logoEl = await page.$x(this.queries.logo)[0];
    let logo = await page.evaluate(el => el.style.backgroundImage, logoEl) as string;
    logo = logo.substring(5, logo.length - 2);

    browser.close();
    return {
      store: 'Epic Games',
      thumbnail: logo,
      title: title,
      url: url,
      org_price: {
        euro: priceEur,
        dollar: priceUsd
      }
    };
  }

  private async grabInfo(page: puppeteer.Page, query: string, defval: string): Promise<string> {
    try {
      let el = await page.$x(query)[0];
      return await page.evaluate(el => el.textContent, el);
    } catch (ex) {
      return defval;
    }
  }

}