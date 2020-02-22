"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const database_1 = require("../database/database");
const scraper_1 = require("../web_scraper/scraper");
const settings = require('../../config/settings.json');
const commandlist = [
    '`$FreeStuff help` - Shows this help page',
    '`$FreeStuff print` - Shows info about this guild',
    '`$FreeStuff guildlist` - Shows a list of all guilds this bot is on',
    '`$FreeStuff scrape <url> [--confirm]` - Scrapes a webstore to fetch the data. Use --confirm to publish to all guilds.',
];
class AdminCommandHandler {
    constructor(bot) {
        bot.on('message', m => {
            if (m.author.bot)
                return;
            if (!m.guild)
                return;
            if (!m.content.toLowerCase().startsWith('$freestuff'))
                return;
            if (!m.guild.me.permissionsIn(m.channel).has('SEND_MESSAGES'))
                return;
            if (!settings.admins.includes(m.author.id))
                return;
            let args = m.content.split(' ');
            args.splice(0, 1);
            let success = this.handleCommand(args.splice(0, 1)[0] || '', args, m);
            if (!success && m.guild.me.permissionsIn(m.channel).has('ADD_REACTIONS'))
                m.react('🤔');
        });
    }
    handleCommand(command, args, orgmes) {
        let reply = (message, content, footer, color, image) => {
            orgmes.channel.send({ embed: {
                    color: color || 0x2f3136,
                    title: message,
                    description: content,
                    footer: {
                        text: `@${orgmes.author.tag}` + (footer ? ` • ${footer}` : '')
                    },
                    image: {
                        url: image
                    }
                } });
        };
        switch (command.toLowerCase()) {
            case 'help':
                reply('Help is on the way!', 'Available commands:\n' + commandlist.map(c => `• ${c}`).join('\n'));
                return true;
            case 'print':
                database_1.default
                    .collection('guilds')
                    .findOne({ _id: orgmes.guild.id })
                    .then(data => {
                    orgmes.channel.send('```json\n' + JSON.stringify(data, null, 2) + '```');
                })
                    .catch(console.error);
                return true;
            case 'guildlist':
                let out = ''
                    + `**Guilds:** ${index_1.Core.guilds.size}\n`
                    + `**Total Members:** ${index_1.Core.guilds.array().count(g => g.memberCount)}\n`
                    + `\`\`\`\n`;
                let i = 0;
                let remaining = index_1.Core.guilds.size - i;
                while (out.length < 1900 && remaining) {
                    let guild = index_1.Core.guilds.array()[i++];
                    out += `${guild.name} - ${guild.memberCount}\n`;
                    remaining = index_1.Core.guilds.size - i;
                }
                if (remaining) {
                    out += `\n\n+ ${remaining} more...`;
                }
                orgmes.channel.send(out + '```');
                return true;
            case 'scrape':
                if (!args.length) {
                    reply('Huh', 'Missing args[0] - store URL');
                    return false;
                }
                scraper_1.default
                    .fetch(args[0])
                    .then(d => {
                    index_1.Core.messageDistributor.sendToGuild(orgmes.guild, d, false);
                })
                    .catch(err => {
                    reply('Error', '```' + err + '```');
                    console.error(err);
                });
                return true;
        }
        return false;
    }
}
exports.default = AdminCommandHandler;
//# sourceMappingURL=admincommandhandler.js.map