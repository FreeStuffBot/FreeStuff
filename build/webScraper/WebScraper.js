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
const EpicGamesScraper_1 = require("./EpicGamesScraper");
const SteamScraper_1 = require("./SteamScraper");
class WebScraper {
    constructor() {
    }
    static init() {
        WebScraper.scraper = {
            'epic-games': new EpicGamesScraper_1.default(),
            'steam': new SteamScraper_1.default(),
            'gog': undefined,
        };
    }
    static fetch(url) {
        return __awaiter(this, void 0, void 0, function* () {
            let store = '';
            if (/^https?:\/\/(www\.)?epicgames\.com\/store\/.*$/.test(url))
                store = 'epic-games';
            if (/^https?:\/\/store.steampowered\.com\/app\/.*$/.test(url))
                store = 'steam';
            console.log(store);
            if (!store)
                return;
            return yield this.scraper[store].fetch(url);
        });
    }
}
exports.default = WebScraper;
//
WebScraper.scraper = undefined;
//# sourceMappingURL=WebScraper.js.map