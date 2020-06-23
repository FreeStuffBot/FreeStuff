import { FreeStuffBot, Core } from "../index";
import { Message, Guild, MessageOptions } from "discord.js";
import Const from "./const";
import Database from "../database/database";
import { GameInfo, GuildData, GameData, DatabaseGuildData, GameFlag } from "../types";
import { Long } from "mongodb";
import { DbStats } from "../database/db-stats";


export default class MessageDistributor {

  private static readonly BUTTON_STRING = '<:b1:672825613467385857><:b2:672825613500809261><:b3:672825613580501031><:b4:672825613450477579>\n<:b5:672825613513654322><:b6:672825613513392138><:b7:672825613215727645><:b8:672825613157138435>';

  //

  public constructor(bot: FreeStuffBot) { }

  //

  public async distribute(content: GameInfo, announcementId: number) {
    if (content.type != 'free') return; // TODO

    const guilds: DatabaseGuildData[] = await Database
      .collection('guilds')
      .find(
        Core.singleShard
          ? { channel: { $ne: null } }
          : { sharder: { $mod: [Core.options.shardCount, Core.options.shardId] },
              channel: { $ne: null } }
      )
      .toArray();
    if (!guilds) return;

    console.log(`Starting to announce ${content.title} - ${new Date().toLocaleTimeString()}`);
    let announcementsMade = 0;
    for (const g of guilds) {
      if (!g) return;
      try {
        const successful = this.sendToGuild(g, content, false, false);
        if (await successful) {
          await new Promise(res => setTimeout(() => res(), 200));
          announcementsMade++;
        }
      } catch(ex) { console.error(ex); }
    }
    console.log(`Done announcing ${content.title} - ${new Date().toLocaleTimeString()}`);

    (await DbStats.usage).announcements.updateToday(announcementsMade, true);
    if (announcementId >= 0) {
      Database
        .collection('games')
        .updateOne(
          { _id: announcementId },
          { '$inc': { 'analytics.reach': announcementsMade } }
        );
    }
  }

  public test(guild: Guild, content: GameInfo): void {
    Database
      .collection('guilds')
      .findOne({ _id: Long.fromString(guild.id) })
      .then((g: DatabaseGuildData) => {
        if (!g) return;
        this.sendToGuild(g, content, true, true);
      })
      .catch(console.error);
  }

  public async sendToGuild(g: DatabaseGuildData, content: GameInfo, test: boolean, force: boolean): Promise<boolean> {
    const data = Core.databaseManager.parseGuildData(g);
    if (!data) return false;

    // forced will ignore filter settings
    if (!force) {
      if (data.price > content.org_price[data.currency == 'euro' ? 'euro' : 'dollar']) return false;
      if (!!content.flags?.includes(GameFlag.TRASH) && !data.trashGames) return false;
    }

    // check if channel is valid
    if (!data.channelInstance) return false;
    if (!data.channelInstance.send) return false;
    if (!data.channelInstance.guild.available) return false;

    // check if permissions match
    const self = data.channelInstance.guild.me;
    if (!self.permissionsIn(data.channelInstance).has('SEND_MESSAGES')) return false;
    if (!self.permissionsIn(data.channelInstance).has('VIEW_CHANNEL')) return false;
    if (!self.permissionsIn(data.channelInstance).has('EMBED_LINKS')
       && Const.themesWithEmbeds.includes(data.theme)) return false;
    if (!self.permissionsIn(data.channelInstance).has('EXTERNAL_EMOJIS')
       && Const.themesWithExtemotes[data.theme]) data.theme = Const.themesWithExtemotes[data.theme];

    // set content url
    if (!content.url) content.url = content.org_url;

    // build message object
    const messageContent = this.buildMessage(content, data, test);
    if (!messageContent) return false;

    // send the message
    const mes: Message = await data.channelInstance.send(...messageContent) as Message;
    if (data.react && self.permissionsIn(data.channelInstance).has('ADD_REACTIONS'))
      await mes.react('🆓');
    return true;
  }

  public buildMessage(content: GameInfo, data: GuildData, test: boolean): (string | MessageOptions)[] {
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
    if (!builder) return undefined;
    return builder(content, data, test);
  }

  public buildTheme1(content: GameInfo, data: GuildData, test: boolean): (string | MessageOptions)[] {
    let priceString = '';
    if (data.currency == 'euro') priceString = `${content.org_price.euro} €`;
    else if (data.currency == 'usd') priceString = `$${content.org_price.dollar}`;
    const date = new Date(Date.now() + content.until * 1000 * 60 * 60 * 24);
    const until = !content.until || content.until < 0
      ? ''
      : content.until < 7
        ? `until ${date.toLocaleDateString('en-US', { weekday: 'long' })}`
        : content.until == 7
          ? 'for a week'
          : `until ${date.toLocaleDateString('en-US', { weekday: 'long' })} next Week`;

    return [
      data.roleInstance ? data.roleInstance.toString() : '',
      { embed: {
        author: {
          name: Core.text(data, '=announcement_header')
        },
        title: content.title,
        description: `~~${priceString}~~ **${Core.text(data, '=announcement_pricetag_free')}** ${until} • ${Const.storeDisplayNames[content.store]}${content.flags?.includes(GameFlag.TRASH) ? ` • ${Core.text(data, '=game_meta_flag_trash')}` : ''}${content.flags?.includes(GameFlag.THIRDPARTY) ? ` • ${Core.text(data, '=game_meta_flag_thirdparty')}` : ''}\n\n[${MessageDistributor.BUTTON_STRING}](${content.url})`,
        image: {
          url: content.thumbnail
        },
        footer: {
          text: test
            ? Core.text(data, '=announcement_footer_test')
            : Core.text(data, '=announcement_footer', { website: Const.websiteLinkClean })
        },
        color: 0x2f3136,
        thumbnail: {
          url: Const.storeIcons[content.store],
          width: 128,
          height: 128
        }
      }}
    ];
  }

  public buildTheme2(content: GameInfo, data: GuildData, test: boolean): (string | MessageOptions)[] {
    let priceString = '';
    if (data.currency == 'euro') priceString = `${content.org_price.euro} €`;
    else if (data.currency == 'usd') priceString = `$${content.org_price.dollar}`;
    const date = new Date(Date.now() + content.until * 1000 * 60 * 60 * 24);
    const until = !content.until || content.until < 0
      ? ''
      : content.until < 7
        ? `until ${date.toLocaleDateString('en-US', { weekday: 'long' })}`
        : content.until == 7
          ? 'for a week'
          : `until ${date.toLocaleDateString('en-US', { weekday: 'long' })} next Week`;

    return [
      data.roleInstance ? data.roleInstance.toString() : '',
      { embed: {
        author: {
          name: Core.text(data, '=announcement_header')
        },
        title: content.title,
        description: `~~${priceString}~~ **${Core.text(data, '=announcement_pricetag_free')}** ${until} • ${Const.storeDisplayNames[content.store]}${content.flags?.includes(GameFlag.TRASH) ? ` • ${Core.text(data, '=game_meta_flag_trash')}` : ''}${content.flags?.includes(GameFlag.THIRDPARTY) ? ` • ${Core.text(data, '=game_meta_flag_thirdparty')}` : ''}\n\n[${Core.text(data, '=announcement_button_text')}](${content.url})`,
        image: {
          url: content.thumbnail
        },
        footer: {
          text: test
            ? Core.text(data, '=announcement_footer_test')
            : Core.text(data, '=announcement_footer', { website: Const.websiteLinkClean })
        },
        color: 0x2f3136,
        thumbnail: {
          url: Const.storeIcons[content.store],
          width: 128,
          height: 128
        }
      }}
    ];
  }

  public buildTheme3(content: GameInfo, data: GuildData, test: boolean): (string | MessageOptions)[] {
    let priceString = '';
    if (data.currency == 'euro') priceString = `${content.org_price.euro} €`;
    else if (data.currency == 'usd') priceString = `$${content.org_price.dollar}`;
    const date = new Date(Date.now() + content.until * 1000 * 60 * 60 * 24);
    const until = !content.until || content.until < 0
      ? ''
      : content.until < 7
        ? `until ${date.toLocaleDateString('en-US', { weekday: 'long' })}`
        : content.until == 7
          ? 'for a week'
          : `until ${date.toLocaleDateString('en-US', { weekday: 'long' })} next Week`;

    return [
      data.roleInstance ? data.roleInstance.toString() : '',
      { embed: {
        author: {
          name: Core.text(data, '=announcement_header')
        },
        title: content.title,
        description: `~~${priceString}~~ **${Core.text(data, '=announcement_pricetag_free')}** ${until} • ${Const.storeDisplayNames[content.store]}${content.flags?.includes(GameFlag.TRASH) ? ` • ${Core.text(data, '=game_meta_flag_trash')}` : ''}${content.flags?.includes(GameFlag.THIRDPARTY) ? ` • ${Core.text(data, '=game_meta_flag_thirdparty')}` : ''}\n\n[${MessageDistributor.BUTTON_STRING}](${content.url})`,
        footer: {
          text: test
            ? Core.text(data, '=announcement_footer_test')
            : Core.text(data, '=announcement_footer', { website: Const.websiteLinkClean })
        },
        color: 0x2f3136
      }}
    ];
  }

  public buildTheme4(content: GameInfo, data: GuildData, test: boolean): (string | MessageOptions)[] {
    let priceString = '';
    if (data.currency == 'euro') priceString = `${content.org_price.euro} €`;
    else if (data.currency == 'usd') priceString = `$${content.org_price.dollar}`;
    const date = new Date(Date.now() + content.until * 1000 * 60 * 60 * 24);
    const until = !content.until || content.until < 0
      ? ''
      : content.until < 7
        ? `until ${date.toLocaleDateString('en-US', { weekday: 'long' })}`
        : content.until == 7
          ? 'for a week'
          : `until ${date.toLocaleDateString('en-US', { weekday: 'long' })} next Week`;

    return [
      data.roleInstance ? data.roleInstance.toString() : '',
      { embed: {
        author: {
          name: Core.text(data, '=announcement_header')
        },
        title: content.title,
        description: `~~${priceString}~~ **${Core.text(data, '=announcement_pricetag_free')}** ${until} • ${Const.storeDisplayNames[content.store]}${content.flags?.includes(GameFlag.TRASH) ? ` • ${Core.text(data, '=game_meta_flag_trash')}` : ''}${content.flags?.includes(GameFlag.THIRDPARTY) ? ` • ${Core.text(data, '=game_meta_flag_thirdparty')}` : ''}\n\n[${Core.text(data, '=announcement_button_text')}](${content.url})`,
        footer: {
          text: test
            ? Core.text(data, '=announcement_footer_test')
            : Core.text(data, '=announcement_footer', { website: Const.websiteLinkClean })
        },
        color: 0x2f3136
      }}
    ];
  }

  public buildTheme5(content: GameInfo, data: GuildData, test: boolean): (string | MessageOptions)[] {
    return [
      data.roleInstance ? data.roleInstance.toString() : '',
      { embed: {
        author: {
          name: Core.text(data, '=announcement_header')
        },
        title: content.title,
        url: content.url,
        footer: {
          text: test
            ? Core.text(data, '=announcement_footer_test')
            : Core.text(data, '=announcement_footer', { website: Const.websiteLinkClean })
        },
        color: 0x2f3136
      }}
    ];
  }

  public buildTheme6(content: GameInfo, data: GuildData, test: boolean): (string | MessageOptions)[] {
    return [
      data.roleInstance ? data.roleInstance.toString() : '',
      { embed: {
        author: {
          name: Core.text(data, '=announcement_header')
        },
        title: content.title,
        url: content.url,
        footer: {
          text: test
            ? Core.text(data, '=announcement_footer_test')
            : Core.text(data, '=announcement_footer', { website: Const.websiteLinkClean })
        },
        image: {
          url: content.thumbnail
        },
        color: 0x2f3136,
        thumbnail: {
          url: Const.storeIcons[content.store] + '&size=32',
          width: 32,
          height: 32
        }
      }}
    ];
  }

  public buildTheme7(content: GameInfo, data: GuildData, test: boolean): (string | MessageOptions)[] {
    return [
      (data.roleInstance ? data.roleInstance.toString() : '')
      + ' ' + content.url,
      {}
    ];
  }

  public buildTheme8(content: GameInfo, data: GuildData, test: boolean): (string | MessageOptions)[] {
    return [
      (data.roleInstance ? data.roleInstance.toString() : '')
      + ` <${content.url}>`,
      {}
    ];
  }

  public buildTheme9(content: GameInfo, data: GuildData, test: boolean): (string | MessageOptions)[] {
    return [
      (data.roleInstance ? data.roleInstance.toString() : '')
      + ' '
      + Core.text(data, '=announcement_theme9'),
      {}
    ];
  }

}
