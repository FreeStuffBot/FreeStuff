import { FreeStuffBot, Core } from "../index";
import { Message, Guild, MessageOptions } from "discord.js";
import Const from "./const";
import Database from "../database/database";
import { FreeStuffData, GuildData } from "../types";




export default class MessageDistributor {

  constructor(bot: FreeStuffBot) { }

  //

  public distribute(content: FreeStuffData): void {
    Database
      .collection('guilds')
      .find({ })
      .toArray()
      .then(async guilds => {
        if (!guilds) return;
        console.log(`Starting to announce ${content.title} - ${new Date().toLocaleTimeString()}`);
        for (const g of guilds) {
          if (!g) return;
          this.sendToGuild(g, content, false, false);
          await new Promise(res => setTimeout(() => res(), 200));
        }
        console.log(`Done announcing ${content.title} - ${new Date().toLocaleTimeString()}`);
      })
      .catch(console.error);
  }

  public test(guild: Guild, content: FreeStuffData): void {
    Database
      .collection('guilds')
      .findOne({ _id: guild.id })
      .then(g => {
        if (!g) return;
        this.sendToGuild(g, content, true, true);
      })
      .catch(console.error);
  }

  public async sendToGuild(g: any, content: FreeStuffData, test: boolean, force: boolean) {
    const data = Core.databaseManager.parseGuildData(g);
    if (!data) {
      Core.databaseManager.removeGuild(g._id);
      return;
    }

    if (!force) {
      if (data.price > content.org_price[data.currency == 'euro' ? 'euro' : 'dollar']) return;
      if (content.trash && !data.trashGames) return;
    }

    if (!data.channelInstance) return;
    if (!data.channelInstance.send) return;
    if (!data.channelInstance.guild.available) return;
    
    const self = data.channelInstance.guild.me;
    if (!self.permissionsIn(data.channelInstance).has('SEND_MESSAGES')) return;
    if (!self.permissionsIn(data.channelInstance).has('VIEW_CHANNEL')) return;
    if (!self.permissionsIn(data.channelInstance).has('EMBED_LINKS')
       && Const.themesWithEmbeds.includes(data.theme)) return;
    if (!self.permissionsIn(data.channelInstance).has('EXTERNAL_EMOJIS')
       && Const.themesWithExtemotes[data.theme]) data.theme = Const.themesWithExtemotes[data.theme];

    const messageContent = this.buildMessage(content, data, test);
    if (!messageContent) return;
    let setNoMention = false;
    if (data.mentionRoleInstance) {
      if (!data.mentionRoleInstance.mentionable
      && (data.channelInstance.guild.me.hasPermission('MANAGE_ROLES')
       || data.channelInstance.guild.me.hasPermission('MANAGE_ROLES_OR_PERMISSIONS'))) {
        await data.mentionRoleInstance.setMentionable(true);
        setNoMention = true;
       }
    }
    let mes: Message = await data.channelInstance.send(...messageContent) as Message;
    if (data.react && self.permissionsIn(data.channelInstance).has('ADD_REACTIONS'))
      await mes.react('🆓');
    if (setNoMention)
      data.mentionRoleInstance.setMentionable(false);
  }

  public buildMessage(content: FreeStuffData, data: GuildData, test: boolean): (string | MessageOptions)[] {
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

  public buildTheme1(content: FreeStuffData, data: GuildData, test: boolean): (string | MessageOptions)[] {
    let priceString = '';
    if (data.currency == 'euro') priceString = `${content.org_price.euro} €`;
    else if (data.currency == 'usd') priceString = `$${content.org_price.dollar}`;

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
          text: test ? 'Looking good? If not, do: @FreeStuff settings' : `via ${Const.websiteLinkClean}`
        },
        color: 0x2f3136
      }}
    ];
  }

  public buildTheme2(content: FreeStuffData, data: GuildData, test: boolean): (string | MessageOptions)[] {
    let priceString = '';
    if (data.currency == 'euro') priceString = `${content.org_price.euro} €`;
    else if (data.currency == 'usd') priceString = `$${content.org_price.dollar}`;

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
          text: test ? 'Looking good? If not, do: @FreeStuff settings' : `via ${Const.websiteLinkClean}`
        },
        color: 0x2f3136
      }}
    ];
  }

  public buildTheme3(content: FreeStuffData, data: GuildData, test: boolean): (string | MessageOptions)[] {
    let priceString = '';
    if (data.currency == 'euro') priceString = `${content.org_price.euro} €`;
    else if (data.currency == 'usd') priceString = `$${content.org_price.dollar}`;

    return [
      data.mentionRoleInstance ? data.mentionRoleInstance.toString() : '',
      { embed: {
        author: {
          name: 'Free Game!'
        },
        title: content.title,
        description: `~~${priceString}~~ **Free** • ${content.store}\n\n[<:b1:672825613467385857><:b2:672825613500809261><:b3:672825613580501031><:b4:672825613450477579>\n<:b5:672825613513654322><:b6:672825613513392138><:b7:672825613215727645><:b8:672825613157138435>](${content.url})`,
        footer: {
          text: test ? 'Looking good? If not, do: @FreeStuff settings' : `via ${Const.websiteLinkClean}`
        },
        color: 0x2f3136
      }}
    ];
  }

  public buildTheme4(content: FreeStuffData, data: GuildData, test: boolean): (string | MessageOptions)[] {
    let priceString = '';
    if (data.currency == 'euro') priceString = `${content.org_price.euro} €`;
    else if (data.currency == 'usd') priceString = `$${content.org_price.dollar}`;

    return [
      data.mentionRoleInstance ? data.mentionRoleInstance.toString() : '',
      { embed: {
        author: {
          name: 'Free Game!'
        },
        title: content.title,
        description: `~~${priceString}~~ **Free** • ${content.store}\n\n[Get it now](${content.url})`,
        footer: {
          text: test ? 'Looking good? If not, do: @FreeStuff settings' : `via ${Const.websiteLinkClean}`
        },
        color: 0x2f3136
      }}
    ];
  }

  public buildTheme5(content: FreeStuffData, data: GuildData, test: boolean): (string | MessageOptions)[] {
    return [
      data.mentionRoleInstance ? data.mentionRoleInstance.toString() : '',
      { embed: {
        author: {
          name: 'Free Game!'
        },
        title: content.title,
        url: content.url,
        footer: {
          text: test ? 'Looking good? If not, do: @FreeStuff settings' : `via ${Const.websiteLinkClean}`
        },
        color: 0x2f3136
      }}
    ];
  }

  public buildTheme6(content: FreeStuffData, data: GuildData, test: boolean): (string | MessageOptions)[] {
    return [
      data.mentionRoleInstance ? data.mentionRoleInstance.toString() : '',
      { embed: {
        author: {
          name: 'Free Game!'
        },
        title: content.title,
        url: content.url,
        footer: {
          text: test ? 'Looking good? If not, do: @FreeStuff settings' : `via ${Const.websiteLinkClean}`
        },
        image: {
          url: content.thumbnail
        },
        color: 0x2f3136
      }}
    ];
  }

  public buildTheme7(content: FreeStuffData, data: GuildData, test: boolean): (string | MessageOptions)[] {
    return [
      (data.mentionRoleInstance ? data.mentionRoleInstance.toString() : '')
      + ' ' + content.url,
      {}
    ];
  }

  public buildTheme8(content: FreeStuffData, data: GuildData, test: boolean): (string | MessageOptions)[] {
    return [
      (data.mentionRoleInstance ? data.mentionRoleInstance.toString() : '')
      + ` <${content.url}>`,
      {}
    ];
  }

  public buildTheme9(content: FreeStuffData, data: GuildData, test: boolean): (string | MessageOptions)[] {
    return [
      (data.mentionRoleInstance ? data.mentionRoleInstance.toString() : '')
      + ` **${content.title}** is free!\n<${content.url}>`,
      {}
    ];
  }

}