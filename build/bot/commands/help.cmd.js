"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../../types");
const index_1 = require("../../index");
class HelpCommand extends types_1.Command {
    // const commandlist = [
    //   '`@FreeStuff help` - Shows this help page',
    //   '`@FreeStuff about` - Shows some info about the bot',
    //   '`@FreeStuff set` - Change the settings',
    //   '`@FreeStuff test` - Run a test announcement to see if you\'ve set up everything correctly',
    //   '`@FreeStuff invite` - Get an invite link to add this bot to your server',
    //   '`@FreeStuff vote` - Enjoying the service? Give me an upvote on top.gg!',
    // ];
    constructor() {
        super({
            name: 'help',
            desc: 'Yes hello, service center here, how can I help you?',
            trigger: ['help', '?'],
            hideOnHelp: true
        });
    }
    handle(mes, args, repl) {
        const cmdlist = index_1.Core.commandHandler.commands.filter(c => !c.info.hideOnHelp).map(c => `• \`@FreeStuff ${c.info.name}\` ─ ${c.info.desc}`);
        repl('Help is on the way!', '**Available commands:**\n\n' + cmdlist.join('\n\n'));
        return true;
    }
}
exports.default = HelpCommand;
//# sourceMappingURL=help.cmd.js.map