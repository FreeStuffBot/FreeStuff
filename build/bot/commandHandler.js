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
const const_1 = require("./const");
const help_cmd_1 = require("./commands/help.cmd");
const info_cmd_1 = require("./commands/info.cmd");
const invite_cmd_1 = require("./commands/invite.cmd");
const settings_cmd_1 = require("./commands/settings.cmd");
const test_cmd_1 = require("./commands/test.cmd");
const vote_cmd_1 = require("./commands/vote.cmd");
const settings = require('../../config/settings.json');
class CommandHandler {
    constructor(bot) {
        this.commands = [];
        this.commands.push(new help_cmd_1.default());
        this.commands.push(new info_cmd_1.default());
        this.commands.push(new invite_cmd_1.default());
        this.commands.push(new settings_cmd_1.default());
        this.commands.push(new test_cmd_1.default());
        this.commands.push(new vote_cmd_1.default());
        bot.on('message', m => {
            if (m.author.bot)
                return;
            if (!m.guild)
                return;
            if (!m.content.replace('!', '').startsWith(bot.user.toString()) && !m.content.toLowerCase().startsWith('@freestuff'))
                return;
            if (!m.guild.me.permissionsIn(m.channel).has('SEND_MESSAGES'))
                return;
            const args = m.content.split(' ');
            args.splice(0, 1);
            this.handleCommand(args.splice(0, 1)[0] || '', args, m).then(success => {
                if (!success && m.guild.me.permissionsIn(m.channel).has('ADD_REACTIONS'))
                    m.react('🤔');
            }).catch(e => { });
        });
    }
    handleCommand(command, args, orgmes) {
        return __awaiter(this, void 0, void 0, function* () {
            const reply = (message, content, footer, color, image) => {
                if (orgmes.guild.me.permissionsIn(orgmes.channel).has('EMBED_LINKS')) {
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
                }
                else {
                    orgmes.channel.send(`**${message}**\n${content}`);
                }
            };
            //
            if (command == '') {
                reply(`Hey ${orgmes.author.username}!`, 'Type `@FreeStuff help` for a help page!\nType `@FreeStuff info` for information about the bot!\n[Or click here for more info](' + const_1.default.websiteLink + ')');
                return true;
            }
            if (command == 'egg') {
                orgmes.channel.send(':egg:');
                return true;
            }
            //
            const handler = this.commands.find(c => c.info.trigger.includes(command.toLowerCase()));
            if (!handler) {
                if (/set.*/.test(command.toLowerCase())) {
                    reply('You\'re missing a space between the `set` and the `' + command.toLowerCase().substr(3) + '`!', 'To see all available settings use `@FreeStuff settings`');
                    return true;
                }
                return false;
            }
            if (handler.info.serverManagerOnly) {
                if (!orgmes.member.hasPermission('MANAGE_GUILD') && !settings.admins.includes(orgmes.member.id)) {
                    reply('No permission!', 'You need the `manage server` permission to change my settings!', undefined, undefined, 'https://media.discordapp.net/attachments/672907465670787083/672907481957007400/unknown.png');
                    return true;
                }
            }
            if (handler.info.adminOnly) {
                reply('TODO', 'TODO TODO TODO @Maanex');
                return true;
            }
            let back = handler.handle(orgmes, args, reply);
            if (back['then'])
                back = yield back;
            return back;
        });
    }
}
exports.default = CommandHandler;
//# sourceMappingURL=commandHandler.js.map