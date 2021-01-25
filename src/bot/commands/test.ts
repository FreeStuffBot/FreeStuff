import { Message } from "discord.js";
import { ReplyFunction, Command, GuildData } from "../../types";
import { Core, config } from "../../index";
import Const from "../const";
import ParseArgs from "../../util/parse-args";
import { Store } from "freestuff";


export default class TestCommand extends Command {

  private readonly placeholderThumbnails = [
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
        Core.text(g, '=cmd_error_fixable_2', { discordInvite: Const.links.supportInvite })
      );
      return;
    }
    if (!g.channelInstance) {
      repl(
        Core.text(g, '=cmd_test_nochannel_1'),
        Core.text(g, '=cmd_test_nochannel_2', { channel: `#${mes.guild.channels.cache.filter(c => c.type == 'text').random().name}` })
      );
      return true;
    }
    if (!g.channelInstance.guild.me.permissionsIn(g.channelInstance).has('VIEW_CHANNEL')) {
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
    if (!g.channelInstance.guild.me.permissionsIn(g.channelInstance).has('USE_EXTERNAL_EMOJIS')
        && Const.themesWithExtemotes[g.theme]) {
        repl(
          Core.text(g, '=cmd_test_extemotes_1'),
          Core.text(g, '=cmd_test_extemotes_2')
        );
      return true;
    }

    const flags = ParseArgs.parse(args);
    
    try {
      let price = parseFloat(flags.price + '');
      if (!price) price = 19.99;
      Core.messageDistributor.test(mes.guild, {
        id: 0,
        title: Core.text(g, '=cmd_test_announcement_header'),
        org_price: {
          euro: price,
          dollar: price
        },
        price: {
          euro: 0,
          dollar: 0
        },
        store: (Core.languageManager.get(g, 'platform_' + flags.store) ? flags.store as Store : '') || 'steam',
        thumbnail: this.placeholderThumbnails[Math.floor(Math.random() * this.placeholderThumbnails.length)],
        org_url: Const.links.testgame,
        url: Const.links.testgame,
        flags: 0,
        until: null,
        type: 'free',
        store_meta: {
          steam_subids: '12345 98760'
        }
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
    }, 1000 * 10);
    return true;
  }

}