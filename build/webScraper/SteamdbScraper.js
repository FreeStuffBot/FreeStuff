"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer = require("puppeteer");
class SteamdbScraper {
    static fetchFreeGames() {
        return __awaiter(this, void 0, void 0, function* () {
            let browser = yield puppeteer.launch();
            let page = yield browser.newPage();
            yield page.setUserAgent(this.USER_AGENT);
            yield page.goto(this.URL_FREEGAMES);
            yield page.waitFor(1000);
            yield page.screenshot({ path: 'example.png' });
            let entries = yield page.evaluate(() => {
                let entries = document.getElementsByClassName('table-products')[0].querySelector('tbody').children;
                let out = Array.from(entries).map(entry => {
                    try {
                        return {
                            id: entry.getAttribute('data-appid'),
                            type: entry.querySelector('.price-discount>b').innerHTML,
                        };
                    }
                    catch (ex) {
                        return undefined;
                    }
                }).filter(e => !!e);
                return out;
            });
            entries = entries.filter(e => e.type.toLowerCase() == 'keep');
            let ids = entries.map(e => e.id);
            return ids;
        });
    }
    static fetchSubids(gameid) {
        return __awaiter(this, void 0, void 0, function* () {
            let browser = yield puppeteer.launch();
            let page = yield browser.newPage();
            yield page.setUserAgent(this.USER_AGENT);
            yield page.goto(this.URL_SUBIDS.replace('%s', gameid));
            yield page.waitFor(1000);
            yield page.screenshot({ path: 'example.png' });
            let ids = yield page.evaluate(() => {
                return Array.from(document
                    .querySelector('#subs.tab-pane')
                    .querySelector('tbody')
                    .children).filter(e => e
                    .children[2]
                    .innerHTML
                    .toLowerCase()
                    ==
                        'no cost').map(e => e
                    .children[0]
                    .children[0]
                    .innerHTML);
            });
            return ids;
        });
    }
}
exports.default = SteamdbScraper;
SteamdbScraper.URL_FREEGAMES = 'https://steamdb.info/upcoming/free/';
SteamdbScraper.URL_SUBIDS = 'https://steamdb.info/app/%s/subs/';
SteamdbScraper.USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36';
//# sourceMappingURL=SteamdbScraper.js.map