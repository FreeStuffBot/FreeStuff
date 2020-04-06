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
const Const_1 = require("./Const");
const Database_1 = require("../database/Database");
class MessageDistributor {
    constructor(bot) {
    }
    distribute(content) {
        Database_1.default
            .collection('guilds')
            .find({})
            .toArray()
            .then(guilds => {
            if (!guilds)
                return;
            guilds.forEach((g) => __awaiter(this, void 0, void 0, function* () {
                if (!g)
                    return;
                this.sendToGuild(g, content, false, false);
            }));
        })
            .catch(console.error);
    }
    test(guild, content) {
        Database_1.default
            .collection('guilds')
            .findOne({ _id: guild.id })
            .then(g => {
            if (!g)
                return;
            this.sendToGuild(g, content, true, true);
        })
            .catch(console.error);
    }
    sendToGuild(g, content, test, force) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = index_1.Core.databaseManager.parseGuildData(g);
            if (!data) {
                index_1.Core.databaseManager.removeGuild(g._id);
                return;
            }
            if (!force) {
                if (data.price > content.org_price[data.currency == 'euro' ? 'euro' : 'dollar'])
                    return;
                if (content.trash && !data.trashGames)
                    return;
            }
            if (!data.channelInstance)
                return;
            if (!data.channelInstance.send)
                return;
            if (!data.channelInstance.guild.available)
                return;
            const self = data.channelInstance.guild.me;
            if (!self.permissionsIn(data.channelInstance).has('SEND_MESSAGES'))
                return;
            if (!self.permissionsIn(data.channelInstance).has('VIEW_CHANNEL'))
                return;
            if (!self.permissionsIn(data.channelInstance).has('EMBED_LINKS')
                && Const_1.default.themesWithEmbeds.includes(data.theme))
                return;
            if (!self.permissionsIn(data.channelInstance).has('EXTERNAL_EMOJIS')
                && Const_1.default.themesWithExtemotes[data.theme])
                data.theme = Const_1.default.themesWithExtemotes[data.theme];
            const messageContent = this.buildMessage(content, data, test);
            if (!messageContent)
                return;
            let setNoMention = false;
            if (data.mentionRoleInstance) {
                if (!data.mentionRoleInstance.mentionable
                    && (data.channelInstance.guild.me.hasPermission('MANAGE_ROLES')
                        || data.channelInstance.guild.me.hasPermission('MANAGE_ROLES_OR_PERMISSIONS'))) {
                    yield data.mentionRoleInstance.setMentionable(true);
                    setNoMention = true;
                }
            }
            let mes = yield data.channelInstance.send(...messageContent);
            if (data.react && self.permissionsIn(data.channelInstance).has('ADD_REACTIONS'))
                yield mes.react('🆓');
            if (setNoMention)
                data.mentionRoleInstance.setMentionable(false);
        });
    }
    buildMessage(content, data, test) {
        const builder = ([
            this.buildTheme1,
            this.buildTheme2,
            this.buildTheme3,
            this.buildTheme4,
            this.buildTheme5,
            this.buildTheme6,
            this.buildTheme7,
            this.buildTheme8,
            this.buildTheme9,
        ])[data.theme];
        if (!builder)
            return undefined;
        return builder(content, data, test);
    }
    buildTheme1(content, data, test) {
        let priceString = '';
        if (data.currency == 'euro')
            priceString = `${content.org_price.euro} €`;
        else if (data.currency == 'usd')
            priceString = `$${content.org_price.dollar}`;
        return [
            data.mentionRoleInstance ? data.mentionRoleInstance.toString() : '',
            { embed: {
                    author: {
                        name: 'Free Game!'
                    },
                    title: content.title,
                    description: `~~${priceString}~~ **Free** • ${content.store}\n\n[<:b1:672825613467385857><:b2:672825613500809261><:b3:672825613580501031><:b4:672825613450477579>\n<:b5:672825613513654322><:b6:672825613513392138><:b7:672825613215727645><:b8:672825613157138435>](${content.url})`,
                    image: {
                        url: content.thumbnail
                    },
                    footer: {
                        text: test ? 'Looking good? If not, do: @FreeStuff settings' : `via ${Const_1.default.websiteLinkClean}`
                    },
                    color: 0x2f3136
                } }
        ];
    }
    buildTheme2(content, data, test) {
        let priceString = '';
        if (data.currency == 'euro')
            priceString = `${content.org_price.euro} €`;
        else if (data.currency == 'usd')
            priceString = `$${content.org_price.dollar}`;
        return [
            data.mentionRoleInstance ? data.mentionRoleInstance.toString() : '',
            { embed: {
                    author: {
                        name: 'Free Game!'
                    },
                    title: content.title,
                    description: `~~${priceString}~~ **Free** • ${content.store}\n\n[Get it now](${content.url})`,
                    image: {
                        url: content.thumbnail
                    },
                    footer: {
                        text: test ? 'Looking good? If not, do: @FreeStuff settings' : `via ${Const_1.default.websiteLinkClean}`
                    },
                    color: 0x2f3136
                } }
        ];
    }
    buildTheme3(content, data, test) {
        let priceString = '';
        if (data.currency == 'euro')
            priceString = `${content.org_price.euro} €`;
        else if (data.currency == 'usd')
            priceString = `$${content.org_price.dollar}`;
        return [
            data.mentionRoleInstance ? data.mentionRoleInstance.toString() : '',
            { embed: {
                    author: {
                        name: 'Free Game!'
                    },
                    title: content.title,
                    description: `~~${priceString}~~ **Free** • ${content.store}\n\n[<:b1:672825613467385857><:b2:672825613500809261><:b3:672825613580501031><:b4:672825613450477579>\n<:b5:672825613513654322><:b6:672825613513392138><:b7:672825613215727645><:b8:672825613157138435>](${content.url})`,
                    footer: {
                        text: test ? 'Looking good? If not, do: @FreeStuff settings' : `via ${Const_1.default.websiteLinkClean}`
                    },
                    color: 0x2f3136
                } }
        ];
    }
    buildTheme4(content, data, test) {
        let priceString = '';
        if (data.currency == 'euro')
            priceString = `${content.org_price.euro} €`;
        else if (data.currency == 'usd')
            priceString = `$${content.org_price.dollar}`;
        return [
            data.mentionRoleInstance ? data.mentionRoleInstance.toString() : '',
            { embed: {
                    author: {
                        name: 'Free Game!'
                    },
                    title: content.title,
                    description: `~~${priceString}~~ **Free** • ${content.store}\n\n[Get it now](${content.url})`,
                    footer: {
                        text: test ? 'Looking good? If not, do: @FreeStuff settings' : `via ${Const_1.default.websiteLinkClean}`
                    },
                    color: 0x2f3136
                } }
        ];
    }
    buildTheme5(content, data, test) {
        return [
            data.mentionRoleInstance ? data.mentionRoleInstance.toString() : '',
            { embed: {
                    author: {
                        name: 'Free Game!'
                    },
                    title: content.title,
                    url: content.url,
                    footer: {
                        text: test ? 'Looking good? If not, do: @FreeStuff settings' : `via ${Const_1.default.websiteLinkClean}`
                    },
                    color: 0x2f3136
                } }
        ];
    }
    buildTheme6(content, data, test) {
        return [
            data.mentionRoleInstance ? data.mentionRoleInstance.toString() : '',
            { embed: {
                    author: {
                        name: 'Free Game!'
                    },
                    title: content.title,
                    url: content.url,
                    footer: {
                        text: test ? 'Looking good? If not, do: @FreeStuff settings' : `via ${Const_1.default.websiteLinkClean}`
                    },
                    image: {
                        url: content.thumbnail
                    },
                    color: 0x2f3136
                } }
        ];
    }
    buildTheme7(content, data, test) {
        return [
            (data.mentionRoleInstance ? data.mentionRoleInstance.toString() : '')
                + ' ' + content.url,
            {}
        ];
    }
    buildTheme8(content, data, test) {
        return [
            (data.mentionRoleInstance ? data.mentionRoleInstance.toString() : '')
                + ` <${content.url}>`,
            {}
        ];
    }
    buildTheme9(content, data, test) {
        return [
            (data.mentionRoleInstance ? data.mentionRoleInstance.toString() : '')
                + ` **${content.title}** is free!\n<${content.url}>`,
            {}
        ];
    }
}
exports.default = MessageDistributor;
//# sourceMappingURL=MessageDistributor.js.map