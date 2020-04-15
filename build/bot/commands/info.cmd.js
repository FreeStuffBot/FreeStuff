"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../../types");
const const_1 = require("../const");
class InfoCommand extends types_1.Command {
    constructor() {
        super({
            name: 'info',
            desc: 'Who? What? How?',
            trigger: ['info', 'information', 'about']
        });
    }
    handle(mes, args, repl) {
        repl('FreeStuff Bot', `Bot made by [Maanex](https://maanex.tk/?utm_source=freestuffbot&utm_medium=about&utm_campaign=project) with help\nfrom [some amazing people](https://freestuffbot.xyz/about#more)

[About / Website](${const_1.default.websiteLink})

[Click here to add it to your server](${const_1.default.inviteLink})

[Report a bug or get in contact](${const_1.default.discordInvite})`, 'Copyright © 2020 Tude', 0x00b0f4); // Haha yes, multi-line string
        return true;
    }
}
exports.default = InfoCommand;
//# sourceMappingURL=info.cmd.js.map