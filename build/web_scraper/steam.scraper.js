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
const worker_1 = require("./worker");
class SteamScraper extends worker_1.default {
    constructor() {
        super(...arguments);
        this.queries = {
            price: '.discount_original_price',
            title: '.apphub_AppName',
            image: '.game_header_image_full',
        };
    }
    fetch(url) {
        return __awaiter(this, void 0, void 0, function* () {
            let browser = yield puppeteer.launch();
            let page = yield browser.newPage();
            yield page.goto(url);
            yield page.waitFor(5000);
            yield page.screenshot({ path: 'example.png' });
            let price = yield this.grabInfo(page, this.queries.price, '9.99 €');
            let priceEur = parseFloat(price.substring(0, price.length - 2).split(',').join('.'));
            let priceUsd = Math.ceil(priceEur * 1.09) - .01;
            let title = yield this.grabInfo(page, this.queries.title, 'Unknown');
            let image = yield page.evaluate(el => console.log(el), yield page.$(this.queries.image)[0]);
            browser.close();
            return {
                store: 'Epic Games',
                thumbnail: undefined,
                title: title,
                url: url,
                org_price: {
                    euro: priceEur,
                    dollar: priceUsd
                }
            };
        });
    }
    grabInfo(page, query, defval) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let el = yield page.$(query)[0];
                return yield page.evaluate(el => el.textContent, el);
            }
            catch (ex) {
                return defval;
            }
        });
    }
}
exports.default = SteamScraper;
//# sourceMappingURL=steam.scraper.js.map