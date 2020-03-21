"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const Const_1 = require("./Const");
const settings = require('../../config/settings.json');
const commandlist = [
    '`@FreeStuff help` - Shows this help page',
    '`@FreeStuff about` - Shows some info about the bot',
    '`@FreeStuff set` - Change the settings',
    '`@FreeStuff test` - Run a test announcement to see if you\'ve set up everything correctly',
    '`@FreeStuff invite` - Get an invite link to add this bot to your server',
    '`@FreeStuff vote` - Enjoying the service? Give me an upvote on top.gg!',
];
const testCooldown = [];
const testCooldownHarsh = [];
class CommandHandler {
    constructor(bot) {
        bot.on('message', m => {
            if (m.author.bot)
                return;
            if (!m.guild)
                return;
            if (!m.content.replace('!', '').startsWith(bot.user.toString()) && !m.content.toLowerCase().startsWith('@freestuff'))
                return;
            if (!m.guild.me.permissionsIn(m.channel).has('SEND_MESSAGES'))
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
            case '':
                reply(`Hey ${orgmes.author.username}!`, 'Type `@FreeStuff help` for a help page!\nType `@FreeStuff info` for information about the bot!\n[Or click here for more info](' + Const_1.default.websiteLink + ')');
                return true;
            case 'help':
                reply('Help is on the way!', 'Available commands:\n' + commandlist.map(c => `• ${c}`).join('\n'));
                return true;
            case 'about':
            case 'info':
            case 'information':
                reply('Free Stuff Bot', `Bot made by [Maanex](https://maanex.tk/?utm_source=freestuffbot&utm_medium=about&utm_campaign=project)\n\n[About / Website](${Const_1.default.websiteLink})\n\n[Click here to add it to your server](${Const_1.default.inviteLink})\n\n[Report a bug or get in contact](${Const_1.default.discordInvite})`, 'Copyright © 2020 Tude', 0x00b0f4);
                return true;
            case 'set':
            case 'settings':
            case 'config':
            case 'configure':
            case 'change':
                if (!orgmes.member.hasPermission('MANAGE_GUILD') && !settings.admins.includes(orgmes.member.id)) {
                    reply('No permission!', 'You need the `manage server` permission to change my settings!', undefined, undefined, 'https://media.discordapp.net/attachments/672907465670787083/672907481957007400/unknown.png');
                    return true;
                }
                index_1.Core.databaseManager.getGuildData(orgmes.guild).then(guilddata => {
                    if (args.length < 1) {
                        let c = '@FreeStuff ' + command.toLowerCase();
                        orgmes.channel.send({ embed: {
                                title: 'Missing arguments!',
                                description: 'Use the `@FreeStuff test` command to test if everything is working correctly!',
                                footer: { text: `@${orgmes.author.tag}` },
                                color: 0x2f3136,
                                fields: [
                                    '`' + c + ' channel #' + ((guilddata && guilddata.channelInstance) ? guilddata.channelInstance.name : 'channel') + '` change the channel the bot will announce stuff in!',
                                    '`' + c + ' mention @' + ((guilddata && guilddata.mentionRoleInstance) ? guilddata.mentionRoleInstance.name : 'role') + '` let the bot mention a certain role. Useful for self-roles etc.',
                                    '`' + c + ' mention` to not let the bot mention anyone. The bot won\'t mention anyone by default!',
                                    '`' + c + ' theme ' + (guilddata ? (guilddata.theme + 1) : 1) + '` change the theme in which the bot will display the annoucement. See all available themes [here](' + Const_1.default.themeListLink + ')',
                                    '`' + c + ' currency ' + (guilddata ? (guilddata.currency == 'euro' ? '€' : '$') : '€') + '` to change the currency displayed in the announcement. You can use € or $.',
                                    '`' + c + ' reaction ' + (guilddata ? (guilddata.react ? 'on' : 'off') : 'off') + '` toggle auto reaction on or off. This will make the bot react with the :free: emoji on every new annoucement.',
                                ].map(l => { return { name: l.split('` ')[0] + '`', value: l.split('` ')[1] }; })
                            } });
                        return true;
                    }
                    switch (args[0].toLowerCase()) {
                        case 'channel':
                            if (args.length < 2) {
                                reply('Sure, just tell me where!', 'Example: `@FreeStuff set channel #' + orgmes.guild.channels.filter(c => c.type == 'text').random().name + '`');
                                break;
                            }
                            let channel = orgmes.mentions.channels.first();
                            if (!channel) {
                                const result = isNaN(parseInt(args[1]))
                                    ? orgmes.guild.channels.find(find => find.name.toLowerCase() == args[1].toLowerCase())
                                    : orgmes.guild.channels.find(find => find.id == args[1]);
                                if (!result) {
                                    reply(`I'm sorry,`, `but I just don't seem to find the channel \`${args[1]}\`!`);
                                    return;
                                }
                                else if (channel.type != 'text' && channel.type != 'news') {
                                    reply('Interesting choice of channel!', 'I would prefer a regular text channel though!');
                                    return;
                                }
                                else
                                    channel = result;
                            }
                            if (channel.type != 'text' && channel.type != 'news') {
                                reply('Interesting choice of channel!', 'I would prefer a regular text channel though!');
                            }
                            else if (!channel.guild.me.permissionsIn(channel).has('VIEW_CHANNEL')) {
                                reply('Oh no!', `The channel #${channel.name} is not visible to me! Please edit my permissions in this channel like so:`, undefined, undefined, 'https://media.discordapp.net/attachments/672907465670787083/690942039218454558/unknown.png');
                            }
                            else if (!channel.guild.me.permissionsIn(channel).has('SEND_MESSAGES')) {
                                reply('I wish I could...', `... but I don't have the permission to do so! Please check my permissions in #${channel.name} and make sure I can send messages!`, undefined, undefined, 'https://media.discordapp.net/attachments/672907465670787083/690942039218454558/unknown.png');
                            }
                            else {
                                index_1.Core.databaseManager.changeSetting(orgmes.guild, guilddata, 'channel', channel.id);
                                reply('Alright!', 'From now on I will announce free games in ' + channel.toString());
                            }
                            break;
                        case 'mention':
                            if (args.length < 2) {
                                if (guilddata.mentionRole) {
                                    index_1.Core.databaseManager.changeSetting(orgmes.guild, guilddata, 'roleMention', undefined);
                                    reply('As you wish!', 'I will now no longer ping any roles when games are free!');
                                }
                                else {
                                    reply('Nothing has changed!', `I'll continue not pinging anyone! If you actually do want me to ping someone when games are free, use \`@FreeStuff set mention @role\``);
                                }
                                break;
                            }
                            if (orgmes.mentions.everyone) {
                                if (guilddata.channelInstance && !orgmes.guild.me.permissionsIn(guilddata.channelInstance).has('MENTION_EVERYONE')) {
                                    reply('Oh no!', `I don't have the permission to mention @everyone in ${guilddata.channelInstance.toString}!`);
                                    break;
                                }
                                index_1.Core.databaseManager.changeSetting(orgmes.guild, guilddata, 'roleMention', '1');
                                reply('<:feelspingman:672921662987042867>', `@everyone it is!`);
                                break;
                            }
                            if (!orgmes.mentions.roles.size) {
                                reply('Oops!', `${args[1]} doesn't look like a role to me :thinking:`);
                                break;
                            }
                            let role = orgmes.mentions.roles.first();
                            if (!role)
                                return;
                            index_1.Core.databaseManager.changeSetting(orgmes.guild, guilddata, 'roleMention', role.id);
                            reply('<:feelspingman:672921662987042867>', `I will now ping ${role} whenever there's free games to grab!`);
                            break;
                        case 'theme':
                            if (args.length < 2) {
                                reply('Yes I can, just which one?', `If you want to change your current theme please use \`@FreeStuff set theme <theme>\`\nA full list of all available themes can be found [Here](${Const_1.default.themeListLink})`);
                                break;
                            }
                            if (['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(args[1])) {
                                index_1.Core.databaseManager.changeSetting(orgmes.guild, guilddata, 'theme', parseInt(args[1]) - 1);
                                reply('Looking good!', 'New theme was applied successfully! Take a look with `@FreeStuff test`!');
                            }
                            else {
                                reply('Oh no!', `Couldn't find the theme ${args[1]}!\n[Here's a full list of all the available themes!](${Const_1.default.themeListLink})`);
                            }
                            break;
                        case 'currency':
                            if (args.length < 2) {
                                reply('Sure, just tell me which one!', 'To change the currency, please use `@FreeStuff set currency <currency>`, with <currency> being either € or $');
                                break;
                            }
                            if (['€', 'euro', 'eur'].includes(args[1].toLowerCase())) {
                                if (guilddata.currency != 'euro')
                                    index_1.Core.databaseManager.changeSetting(orgmes.guild, guilddata, 'currency', 0);
                                reply('Euro it is!', 'Good choice!');
                            }
                            else if (['$', 'dollar', 'usd'].includes(args[1].toLowerCase())) {
                                if (guilddata.currency != 'usd')
                                    index_1.Core.databaseManager.changeSetting(orgmes.guild, guilddata, 'currency', 1);
                                reply('US-Dollar it is!', 'Good choice!');
                            }
                            else {
                                reply(args[1] + 'is not a supported currency, sorry!', 'Please choose either `euro` or `usd`!');
                            }
                            break;
                        case 'react':
                        case 'reaction':
                            if (args.length < 2) {
                                reply(`I'm currently ${guilddata.react ? 'reacting to annoucements!' : 'not reacting to announcements!'}`, 'To change that, use `@FreeStuff set reaction on/off`');
                                break;
                            }
                            if (args[1].toLowerCase() == 'on/off') {
                                reply('Well you can\'t have both!', 'Choose either on or off!');
                            }
                            else if (['on', 'true', '1'].includes(args[1].toLowerCase())) {
                                if (!guilddata.react)
                                    index_1.Core.databaseManager.changeSetting(orgmes.guild, guilddata, 'react', 1);
                                reply('As you command!', 'I will now add a :free: reaction to every free game I announce!');
                            }
                            else if (['off', 'false', '0'].includes(args[1].toLowerCase())) {
                                if (guilddata.react)
                                    index_1.Core.databaseManager.changeSetting(orgmes.guild, guilddata, 'react', 0);
                                reply('Allright!', 'I\'ll stop doing that...');
                            }
                            else {
                                reply('uhhhhh', `What's ${args[1]} supposed to mean? Please either go for on or for off, thanks!`);
                            }
                            break;
                        default:
                            reply(`Setting ${args[0]} not found!`, 'Type `@FreeStuff settings` for an overview over all available settings!');
                            break;
                    }
                })
                    .catch(err => {
                    reply('An error occured!', 'We\'re trying to fix this issue as soon as possible!');
                    console.log(err);
                });
                return true;
            case 'test':
                if (testCooldownHarsh.includes(orgmes.guild.id))
                    return true;
                if (testCooldown.includes(orgmes.guild.id)) {
                    reply('Command is on cooldown!', 'This command has a 10 second cooldown, please wait a bit!');
                    testCooldownHarsh.push(orgmes.guild.id);
                    return true;
                }
                index_1.Core.databaseManager.getGuildData(orgmes.guild).then(d => {
                    if (!d.channelInstance) {
                        reply('Whoops!', `Looks like there's no channel specified!\nDo \`@FreeStuff set channel #${orgmes.guild.channels.filter(c => c.type == 'text').random().name}\` to tell me where to annouce free games!`);
                        return true;
                    }
                    if (!d.channelInstance.guild.me.permissionsIn(d.channelInstance).has('SEND_MESSAGES')) {
                        reply('Whoops!', `Looks like I don't have the permission to write in that channel!`);
                        return true;
                    }
                    index_1.Core.messageDistributor.test(orgmes.guild, {
                        title: 'Game name here',
                        org_price: {
                            euro: 19.99,
                            dollar: 19.99
                        },
                        store: 'Store xyz',
                        thumbnail: 'https://cdn.discordapp.com/attachments/672907465670787083/673119991649796106/unknown.png',
                        url: Const_1.default.testGameLink
                    });
                }).catch(err => {
                    reply('An error occured!', 'We\'re trying to fix this issue as soon as possible!');
                    console.log(err);
                });
                testCooldown.push(orgmes.guild.id);
                setTimeout(() => {
                    testCooldown.splice(testCooldown.indexOf(orgmes.guild.id), 1);
                    testCooldownHarsh.splice(testCooldownHarsh.indexOf(orgmes.guild.id), 1);
                }, 10000);
                return true;
            case 'egg':
                orgmes.channel.send(':egg:');
                return true;
            case 'get':
            case 'link':
            case 'invite':
            case 'add':
            case 'join':
                reply('Sure!', `[Click here to add me to your server!](${Const_1.default.inviteLink})`);
                return true;
            case 'vote':
            case 'topgg':
            case 'top':
            case 'botlist':
            case 'v':
                reply('Enjoing the service?', `[Click here to upvote me on top.gg!](${Const_1.default.inviteLink})`);
                return true;
        }
        if (/set.*/.test(command.toLowerCase())) {
            reply('You\'re missing a space between the `set` and the `' + command.toLowerCase().substr(3) + '`!', 'To see all available settings use `@FreeStuff settings`');
            return true;
        }
        return false;
    }
}
exports.default = CommandHandler;
//# sourceMappingURL=CommandHandler.js.map