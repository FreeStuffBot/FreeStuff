"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongo_adapter_1 = require("./mongo.adapter");
class Database {
    constructor() {
    }
    static init() {
        Database.client = mongo_adapter_1.default.client;
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