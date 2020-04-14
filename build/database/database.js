"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoAdapter_1 = require("./mongoAdapter");
class Database {
    constructor() {
    }
    static init() {
        Database.client = mongoAdapter_1.default.client;
    }
    static get(name) {
        return this.client ? this.client.db(name) : null;
    }
    static collection(collection) {
        return this.client ? this.client.db('freestuffbot').collection(collection) : null;
    }
}
exports.default = Database;
//# sourceMappingURL=database.js.map