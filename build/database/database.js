"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MongoAdapter_1 = require("./MongoAdapter");
class Database {
    constructor() {
    }
    static init() {
        Database.client = MongoAdapter_1.default.client;
    }
    static get(name) {
        return this.client ? this.client.db(name) : null;
    }
    static collection(collection) {
        return this.client ? this.client.db('freestuffbot').collection(collection) : null;
    }
}
exports.default = Database;
//# sourceMappingURL=Database.js.map