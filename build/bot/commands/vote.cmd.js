"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../../types");
const const_1 = require("../const");
class VoteCommand extends types_1.Command {
    constructor() {
        super({
            name: 'vote',
            desc: 'Enjoying the service? Give me an upvote on top.gg!',
            trigger: ['vote', 'topgg', 'top', 'botlist', 'v']
        });
    }
    handle(mes, args, repl) {
        repl('Enjoing the free games?', `[Click here to upvote me on top.gg!](${const_1.default.topGGLink})`);
        return true;
    }
}
exports.default = VoteCommand;
//# sourceMappingURL=vote.cmd.js.map