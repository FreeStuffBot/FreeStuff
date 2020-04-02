"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongo = require("mongodb");
class MongoAdapter {
    constructor() {
    }
    static connect(url) {
        return new Promise((resolve, reject) => {
            mongo.MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
                if (err) {
                    reject(err);
                }
                else {
                    MongoAdapter.client = client;
                    resolve(client);
                }
            });
        });
    }
    disconnect() {
        MongoAdapter.client.close();
    }
}
exports.default = MongoAdapter;
//# sourceMappingURL=mongo.adapter.js.map