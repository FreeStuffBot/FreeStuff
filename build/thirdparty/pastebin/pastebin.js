"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../../database/database");
const settings = require('../../../config/settings.json').thirdparty;
/** @deprecated */
class Pastebin {
    /** @deprecated */
    static init() {
        // Pastebin.api = new PastebinAPI({
        //   'api_dev_key' : settings.pastebin.apikey,
        //   'api_user_name' : settings.pastebin.username,
        //   'api_user_password' : settings.pastebin.password
        // });
    }
    /** @deprecated */
    static post(content, title) {
        Pastebin.api.createPaste({
            text: content,
            title: title || 'bump',
            format: null,
            privacy: 2
        });
    }
    /** @deprecated */
    static postDatabaseBump(collection) {
        database_1.default
            .collection(collection)
            .find({})
            .toArray()
            .then(a => {
            const dateday = new Date().toLocaleDateString();
            const datetime = new Date().toLocaleString();
            const title = `FreeStuff dbbump - ${collection} ${dateday}`;
            const content = `FreeStuffBot Database Bump backup\nCollection: ${collection}\nTime: ${datetime}\n\n${JSON.stringify(a)}`;
            console.log(title);
            console.log(content);
            Pastebin.post(content, title);
        })
            .catch(console.error);
    }
}
exports.default = Pastebin;
//# sourceMappingURL=pastebin.js.map