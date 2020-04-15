"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Command {
    constructor(info) {
        this.info = info;
        if (info.adminOnly === undefined)
            info.adminOnly = false;
        if (info.serverManagerOnly === undefined)
            info.serverManagerOnly = false;
        if (info.hideOnHelp === undefined)
            info.hideOnHelp = false;
    }
}
exports.Command = Command;
//# sourceMappingURL=types.js.map