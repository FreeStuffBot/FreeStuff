
import * as puppeteer from "puppeteer";



export default class SteamdbScraper {

  private static readonly URL_FREEGAMES = 'https://steamdb.info/upcoming/free/';
  private static readonly URL_SUBIDS = 'https://steamdb.info/app/%s/subs/';
  private static readonly USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36';

  public static async fetchFreeGames(): Promise<String[]> {
    let browser = await puppeteer.launch();
    let page = await browser.newPage();
    await page.setUserAgent(this.USER_AGENT);
    await page.goto(this.URL_FREEGAMES);
    await page.waitFor(1000);
    await page.screenshot({path: 'example.png'});

    let entries = await page.evaluate(() => {
      let entries = document.getElementsByClassName('table-products')[0].querySelector('tbody').children;
      let out = Array.from(entries).map(entry => {
        try {
          return {
            id: entry.getAttribute('data-appid'),
            type: entry.querySelector('.price-discount>b').innerHTML,
          }
        } catch(ex) { return undefined; }
      }).filter(e => !!e);
      return out;
    });

    entries = entries.filter(e => e.type.toLowerCase() == 'keep');
    let ids = entries.map(e => e.id);
    return ids;
  }

  public static async fetchSubids(gameid: string): Promise<String[]> {
    let browser = await puppeteer.launch();
    let page = await browser.newPage();
    await page.setUserAgent(this.USER_AGENT);
    await page.goto(this.URL_SUBIDS.replace('%s', gameid));
    await page.waitFor(1000);
    await page.screenshot({path: 'example.png'});

    let ids = await page.evaluate(() => {
      return  Array.from(
                document
                  .querySelector('#subs.tab-pane')
                  .querySelector('tbody')
                  .children
              ).filter(
                e => e
                  .children[2]
                  .innerHTML
                  .toLowerCase()
                  ==
                  'no cost'
              ).map(
                e => e
                  .children[0]
                  .children[0]
                  .innerHTML
              );
    });
    return ids;
  }

}