"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../../types");
const const_1 = require("../const");
class InviteCommand extends types_1.Command {
    constructor() {
        super({
            name: 'invite',
            desc: 'Get an invite link to add the bot to your own server!',
            trigger: ['get', 'link', 'invite', 'add', 'join']
        });
    }
    handle(mes, args, repl) {
        repl('Sure!', `[Click here to add me to your server!](${const_1.default.inviteLink})`);
        return true;
    }
}
exports.default = InviteCommand;
//# sourceMappingURL=invite.cmd.js.map