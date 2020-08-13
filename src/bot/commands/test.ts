import { Message } from "discord.js";
import { ReplyFunction, Command, GuildData, Store } from "../../types";
import { Core, config } from "../../index";
import Const from "../const";
import ParseArgs from "../../util/parse-args";


export default class TestCommand extends Command {

  private readonly thumbsUpImages = [
    // 'https://cdn.discordapp.com/attachments/672907465670787083/673119991649796106/unknown.png',
    // 'https://media.discordapp.net/attachments/672907465670787083/693591561262465124/fetchimage.png',
    // 'https://media.discordapp.net/attachments/672907465670787083/693591793479975013/1562325563_hidethepainharold_promotions.png',
    // 'https://media.discordapp.net/attachments/672907465670787083/693592156530540595/106479_Medium.png',
    // 'https://media.discordapp.net/attachments/672907465670787083/693592862763515914/23silg.png?width=1204&height=677',
    'https://media.discordapp.net/attachments/672907465670787083/710466653380411462/thumbnail_placeholder.png'
  ];

  private testCooldown = [ ];
  private testCooldownHarsh = [ ];

  public constructor() {
    super({
      name: 'test',
      desc: '=cmd_test_desc',
      trigger: [ 'test' ],
      serverManagerOnly: true
    });
  }

  public handle(mes: Message, args: string[], g: GuildData, repl: ReplyFunction): boolean {
    if (this.testCooldownHarsh.includes(mes.guild.id))
      return true;
    if (this.testCooldown.includes(mes.guild.id)) {
      repl(
        Core.text(g, '=cmd_on_cooldown_1'),
        Core.text(g, '=cmd_on_cooldown_2', { time: '10' })
      );
      this.testCooldownHarsh.push(mes.guild.id);
      return true;
    }

    if (!g) {
      Core.databaseManager.addGuild(mes.guild);
      repl(
        Core.text(g, '=cmd_error_fixable_1'),
        Core.text(g, '=cmd_error_fixable_2', { discordInvite: Const.discordInvite })
      );
      return;
    }
    if (!g.channelInstance) { 
      repl(
        Core.text(g, '=cmd_test_nochannel_1'),
        Core.text(g, '=cmd_test_nochannel_2', { channel: `#${mes.guild.channels.filter(c => c.type == 'text').random().name}` })
      );
      return true;
    }
    if (!g.channelInstance.guild.me.permissionsIn(g.channelInstance).has('READ_MESSAGES')) {        
      repl(
        Core.text(g, '=cmd_test_nosee_1'),
        Core.text(g, '=cmd_test_nosee_2', { channel: g.channelInstance.toString() })
      );
      return true;
    }
    if (!g.channelInstance.guild.me.permissionsIn(g.channelInstance).has('SEND_MESSAGES')) {
      repl(
        Core.text(g, '=cmd_test_nosend_1'),
        Core.text(g, '=cmd_test_nosend_2', { channel: g.channelInstance.toString() })
      );
      return true;
    }
    if (!g.channelInstance.guild.me.permissionsIn(g.channelInstance).has('EMBED_LINKS')
        && Const.themesWithEmbeds.includes(g.theme)) {
        repl(
          Core.text(g, '=cmd_test_noembeds_1'),
          Core.text(g, '=cmd_test_noembeds_2', { channel: g.channelInstance.toString() })
        );
      return true;
    }
    if (!g.channelInstance.guild.me.permissionsIn(g.channelInstance).has('EXTERNAL_EMOJIS')
        && Const.themesWithExtemotes[g.theme]) {
        repl(
          Core.text(g, '=cmd_test_extemotes_1'),
          Core.text(g, '=cmd_test_extemotes_2')
        );
      return true;
    }

    const flags = ParseArgs.parse(args);
    
    try {
      Core.messageDistributor.test(mes.guild, {
        title: Core.text(g, '=cmd_test_announcement_header'),
        org_price: {
          euro: parseFloat(flags.price + '') || 19.99,
          dollar: parseFloat(flags.price + '') || 19.99
        },
        price: {
          euro: g.price,
          dollar: g.price
        },
        store: (Const.storeDisplayNames[flags.store + ''] ? flags.store as Store : '') || 'steam',
        thumbnail: this.thumbsUpImages[Math.floor(Math.random() * this.thumbsUpImages.length)],
        org_url: Const.testGameLink,
        url: Const.testGameLink,
        flags: [],
        steamSubids: '12345 98760',
        until: flags.until ? parseInt(flags.until + '', 10) : -1,
        type: 'free'
      });
    } catch (ex) {
      if (Object.keys(flags)) {
        repl('Yikes', 'Some of the flags you set caused errors. Try removing them.');
      } else {
        repl(
          Core.text(g, '=cmd_error_fixable_1'),
          Core.text(g, '=cmd_error_fixable_2')
        );
      }
    }
    
    if (config.admins.includes(mes.author.id)) return true;

    this.testCooldown.push(mes.guild.id);
    setTimeout(() => {
      this.testCooldown.splice(this.testCooldown.indexOf(mes.guild.id), 1);
      this.testCooldownHarsh.splice(this.testCooldownHarsh.indexOf(mes.guild.id), 1);
    }, 10_000);
    return true;
  }

}