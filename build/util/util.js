"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Util {
    constructor() { }
    static init() {
        Object.defineProperties(Array.prototype, {
            stack: {
                value: function () {
                    let out = 0;
                    this.forEach(e => out += e);
                    return out;
                }
            },
            count: {
                value: function (counter) {
                    let out = 0;
                    this.forEach(e => out += counter(e));
                    return out;
                }
            },
            iterate: {
                value: function (counter) {
                    let out = undefined;
                    this.forEach(e => out = counter(e, out));
                    return out;
                }
            }
        });
    }
}
exports.Util = Util;
exports.rand = max => Math.floor(Math.random() * max);
//# sourceMappingURL=util.js.map