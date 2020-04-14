"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function hook_std(callback, std) {
    var old_write = std.write;
    // @ts-ignore
    std.write = (function (write) {
        return function (string, encoding, fd) {
            write.apply(std, arguments);
            callback(string, encoding, fd);
        };
    })(std.write);
    return function () {
        std.write = old_write;
    };
}
exports.hook_std = hook_std;
//# sourceMappingURL=stdutils.js.map