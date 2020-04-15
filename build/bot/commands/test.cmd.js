"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../../types");
const index_1 = require("../../index");
const const_1 = require("../const");
class TestCommand extends types_1.Command {
    constructor() {
        super({
            name: 'test',
            desc: 'Run a test announcement to see if you\'ve set up everything correctly. Requires you to have the __Manage Server__ permission.',
            trigger: ['test'],
            serverManagerOnly: true
        });
        this.thumbsUpImages = [
            'https://cdn.discordapp.com/attachments/672907465670787083/673119991649796106/unknown.png',
            'https://media.discordapp.net/attachments/672907465670787083/693591561262465124/fetchimage.png',
            'https://media.discordapp.net/attachments/672907465670787083/693591793479975013/1562325563_hidethepainharold_promotions.png',
            'https://media.discordapp.net/attachments/672907465670787083/693592156530540595/106479_Medium.png',
            'https://media.discordapp.net/attachments/672907465670787083/693592862763515914/23silg.png?width=1204&height=677',
        ];
        this.testCooldown = [];
        this.testCooldownHarsh = [];
    }
    handle(mes, args, repl) {
        if (this.testCooldownHarsh.includes(mes.guild.id))
            return true;
        if (this.testCooldown.includes(mes.guild.id)) {
            repl('Command is on cooldown!', 'This command has a 10 second cooldown, please wait a bit!');
            this.testCooldownHarsh.push(mes.guild.id);
            return true;
        }
        index_1.Core.databaseManager.getGuildData(mes.guild).then(d => {
            if (!d.channelInstance) {
                repl('Whoops!', `I'd love to but I don't know where you'd like to have the news!\nDo \`@FreeStuff set channel #${mes.guild.channels.filter(c => c.type == 'text').random().name}\` to tell me where to annouce free games!`);
                return true;
            }
            if (!d.channelInstance.guild.me.permissionsIn(d.channelInstance).has('READ_MESSAGES')) {
                repl('Whoops!', `Looks like I don't have the permission to see the channel ${d.channelInstance}!`);
                return true;
            }
            if (!d.channelInstance.guild.me.permissionsIn(d.channelInstance).has('SEND_MESSAGES')) {
                repl('Whoops!', `Looks like I don't have the permission to send messages in ${d.channelInstance}!`);
                return true;
            }
            if (!d.channelInstance.guild.me.permissionsIn(d.channelInstance).has('EMBED_LINKS')
                && const_1.default.themesWithEmbeds.includes(d.theme)) {
                repl('Oh well...', `The theme you're using uses embeds to make the message look nicer... now the thing is, I don't have the permission to send embeds in ${d.channelInstance}! Either give me the permission \`Embed Links\` or choose a different theme that doesn't use embeds!`);
                return true;
            }
            if (!d.channelInstance.guild.me.permissionsIn(d.channelInstance).has('EXTERNAL_EMOJIS')
                && const_1.default.themesWithExtemotes[d.theme]) {
                repl('Oh well...', `The theme you're using uses external emojis to create the big button. Now you either have to give me the \`Use External Emojis\` permission or tell me to use another theme which doesn't use external emojis!`);
                return true;
            }
            index_1.Core.messageDistributor.test(mes.guild, {
                title: 'Game name here',
                org_price: {
                    euro: 19.99,
                    dollar: 19.99
                },
                store: 'Store xyz',
                thumbnail: this.thumbsUpImages[Math.floor(Math.random() * this.thumbsUpImages.length)],
                url: const_1.default.testGameLink,
                trash: false
            });
        }).catch(err => {
            repl('An error occured!', 'We\'re trying to fix this issue as soon as possible!');
            console.log(err);
        });
        this.testCooldown.push(mes.guild.id);
        setTimeout(() => {
            this.testCooldown.splice(this.testCooldown.indexOf(mes.guild.id), 1);
            this.testCooldownHarsh.splice(this.testCooldownHarsh.indexOf(mes.guild.id), 1);
        }, 10000);
        return true;
    }
}
exports.default = TestCommand;
//# sourceMappingURL=test.cmd.js.map