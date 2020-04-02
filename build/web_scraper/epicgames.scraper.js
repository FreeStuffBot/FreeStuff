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
class EpicGamesScraper extends worker_1.default {
    constructor() {
        super(...arguments);
        this.queries = {
            // price: "#dieselReactWrapper > div > div.WebApp-webApp_e9fb876f.contentGridPosition > div.ProductDetails-wrapper_c97c40cc.contentGridPosition.ProductDetails-marginTopForTopNav_fe34af09.storeSpacingTop > div > div.ProductDetailHeader-wrapper_9de162b7 > div.Description-container_b614d543.ProductDetails-description_1783a42e.gridContentWrapper > div.Description-ctaWrapper_426190ef > div > div > div.PurchaseButton-priceWrapper_3a228d59 > div > div > s",
            // title: "#dieselReactWrapper > div > div.WebApp-webApp_e9fb876f.contentGridPosition > div.ProductDetails-wrapper_c97c40cc.contentGridPosition.ProductDetails-marginTopForTopNav_fe34af09.storeSpacingTop > div > div.ProductDetails-contentTopWrapper_bd8ef381.gridContentWrapper > div > div > div > ul > li:nth-child(2) > a > span",
            // logo: "#dieselReactWrapper > div > div.WebApp-webApp_e9fb876f.contentGridPosition > div.ProductDetails-wrapper_c97c40cc.contentGridPosition.ProductDetails-marginTopForTopNav_fe34af09.storeSpacingTop > div > div.ProductDetailHeader-wrapper_9de162b7 > div.Description-container_b614d543.ProductDetails-description_1783a42e.gridContentWrapper > div.Description-logoContainer_170d205a > div",
            price: '//*[@id="dieselReactWrapper"]/div/div[4]/div[3]/div/div[2]/div[2]/div[3]/div/div/div[1]/div/div/s',
            title: '//*[@id="dieselReactWrapper"]/div/div[4]/div[3]/div/div[1]/div/div/div/ul/li[2]/a',
            logo: '//*[@id="dieselReactWrapper"]/div/div[4]/div[3]/div/div[2]/div[2]/div[1]/div',
            agerestrButton: '//*[@id="dieselReactWrapper"]/div/div[4]/div[4]/div/div[2]/div/button',
        };
    }
    fetch(url) {
        return __awaiter(this, void 0, void 0, function* () {
            let browser = yield puppeteer.launch();
            let page = yield browser.newPage();
            yield page.goto(url);
            yield page.waitFor(5000);
            yield page.screenshot({ path: 'example.png' });
            let agerestrButton = yield this.grabInfo(page, this.queries.agerestrButton + '/span', undefined);
            console.log(agerestrButton);
            if (agerestrButton) {
                let buttons = yield page.$x(this.queries.agerestrButton);
                buttons[0].click();
                page.waitFor(5000);
            }
            yield page.screenshot({ path: 'example.png' });
            let price = yield this.grabInfo(page, this.queries.price, '9.99 €');
            let priceEur = parseFloat(price.substring(0, price.length - 2).split(',').join('.'));
            let priceUsd = Math.ceil(priceEur * 1.09) - .01;
            let title = yield this.grabInfo(page, this.queries.title, 'Unknown');
            let logoEl = yield page.$x(this.queries.logo)[0];
            let logo = yield page.evaluate(el => el.style.backgroundImage, logoEl);
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
                },
                trash: false
            };
        });
    }
    grabInfo(page, query, defval) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let el = yield page.$x(query)[0];
                return yield page.evaluate(el => el.textContent, el);
            }
            catch (ex) {
                return defval;
            }
        });
    }
}
exports.default = EpicGamesScraper;
//# sourceMappingURL=epicgames.scraper.js.map