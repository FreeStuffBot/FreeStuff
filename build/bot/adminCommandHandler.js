"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const database_1 = require("../database/database");
const AsciiTable = require('ascii-table');
const settings = require('../../config/settings.json');
const commandlist = [
    '`$FreeStuff help` - Shows this help page',
    '`$FreeStuff print` - Shows info about this guild',
    '`$FreeStuff guildlist` - Shows a list of all guilds this bot is on',
    '`$FreeStuff scrape <url> [--confirm]` - Scrapes a webstore to fetch the data. Use --confirm to publish to all guilds.',
    '`$FreeStuff stats` - Shows some stats',
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
            case 'stats':
                database_1.default
                    .collection('guilds')
                    .find({})
                    .toArray()
                    .then(a => {
                    const guildData = a.map(index_1.Core.databaseManager.parseGuildData);
                    let total = guildData.length;
                    let channelSet = 0;
                    let dollar = 0;
                    let react = 0;
                    let roleMention = 0;
                    let trashGames = 0;
                    let priceChanged = 0;
                    let themes = [];
                    for (let i = 0; i < 16; i++)
                        themes.push(0);
                    for (let data of guildData) {
                        if (data.channelInstance)
                            channelSet++;
                        if (data.currency == 'usd')
                            dollar++;
                        if (data.react)
                            react++;
                        if (data.mentionRoleInstance)
                            roleMention++;
                        if (data.trashGames)
                            trashGames++;
                        if (data.price !== 3)
                            priceChanged++;
                        themes[data.theme]++;
                    }
                    let round = (a) => Math.round(a * 1000) / 10;
                    let table = new AsciiTable();
                    table.setHeading('changed to', 'amount', 'changed%', 'amount', 'default');
                    table.addRow('channel set', channelSet, round(channelSet / total) + '%', total - channelSet, 'not set');
                    table.addRow('dollar', dollar, round(dollar / total) + '%', total - dollar, 'euro');
                    table.addRow('react', react, round(react / total) + '%', total - react, 'dont react');
                    table.addRow('mention', roleMention, round(roleMention / total) + '%', total - roleMention, 'dont mention');
                    table.addRow('trash', trashGames, round(trashGames / total) + '%', total - trashGames, 'no trash');
                    table.addRow('price changed', priceChanged, round(priceChanged / total) + '%', total - priceChanged, '3€ price');
                    let themeStr = 'Themes:';
                    for (let i = 0; i < 16; i++)
                        themeStr += `\n• Theme ${i + 1}: ${themes[i]} guilds`;
                    reply('The stats', '```' + table.toString() + '\n\n' + themeStr + '```');
                })
                    .catch(err => {
                    reply('Error', '```' + err + '```');
                    console.error(err);
                });
                return true;
            case 'sendfirstnews':
                return;
                database_1.default
                    .collection('guilds')
                    .find({})
                    .toArray()
                    .then(guilds => {
                    if (!guilds)
                        return;
                    const sentTo = [];
                    guilds.forEach((g) => __awaiter(this, void 0, void 0, function* () {
                        if (!g)
                            return;
                        const data = index_1.Core.databaseManager.parseGuildData(g);
                        if (!data) {
                            index_1.Core.databaseManager.removeGuild(g._id);
                            return;
                        }
                        if (!data.channelInstance)
                            return;
                        const owner = data.channelInstance.guild.owner;
                        if (sentTo.includes(owner.id))
                            return;
                        owner.send(firstNewsDM(data.currency == 'euro' ? '3.00€' : '$3.00', owner.user.username)).catch(err => console.log('One person didn\'t let me!'));
                        sentTo.push(owner.id);
                    }));
                })
                    .catch(console.error);
                return true;
        }
        return false;
    }
}
exports.default = AdminCommandHandler;
function firstNewsDM(defaultPrice, username) {
    return {
        embed: {
            "title": `Hey ${username}! Good news!`,
            "description": "This is a quick info for server owners like you that have the FreeStuff Bot added to one of their servers. **tl;dr at the end!**",
            "color": 13455313,
            "footer": {
                "text": "Messages like these will be really rare. Don't worry, we hate spam too!"
            },
            "thumbnail": {
                "url": "https://tude.ga/favicon.freestuff.png"
            },
            "fields": [
                {
                    "name": "Lots of games recently huh?",
                    "value": "The bot really got some attention lately and as a result of that we got more and more free games reported by various people. Now while some of you might wanna catch every freebie they can get, you might aswell be one of those who rather take it slow and prefer quality over quantity. Now to tackle this issue and reduce the spam, we added some new features to the bot:"
                },
                {
                    "name": "Minimum original price",
                    "value": `First new setting you can set in your server is the \`@FreeStuff set minimum price <price>\` with <price> being an amount of your choice. Whenever a game is free the bot will from now on first check if the original price - before the sale - was equal or greater than what you've set before it announces the game. We've set the minimum for your server to **${defaultPrice}** now but of course you can change this to your likings at any time!`
                },
                {
                    "name": "Trash games",
                    "value": "We now also occasionally mark games as 'trash'. Which games are trash and which not gets decided by the FreeStuff content moderators and while you might not agree with every decision we make, a game is usually marked as trash if it has really bad reviews or is of generally poor quality. Low prices don't make a game 'trash' since you can filter them out with the minimum price filter as said above. Trash games will now by default no longer reach your server, if you do want to get them though you can re-enable them using `@FreeStuff set trash on`."
                },
                {
                    "name": "That's it for now!",
                    "value": "This DM did not get sent to every user in your server, don't panic! Only you as the server owner recieved it. We're planning on sending out more messages like these in the furure whenever there's things you as the server owner absolutely have to know! But don't stress out, we won't spam your DMs in the slightest - only when it's really necessary, pinky promise! We're also currently moving servers so if anything works not as expected, we're sorry. And stay tuned, we got some more cool stuff in the works :o"
                },
                {
                    "name": "tl;dr 👇",
                    "value": "There is now a setting `@FreeStuff set minimum price <price>` and the bot will no longer annouce games cheaper than that! Oh and we also filter out trash games now, you're welcome! <3"
                }
            ]
        }
    };
}
;
//# sourceMappingURL=adminCommandHandler.js.map