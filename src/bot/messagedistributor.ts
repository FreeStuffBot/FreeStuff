import { FreeStuffBot, Core } from "../index";
import { Message, Guild, TextChannel, RichEmbedOptions, RichEmbed, MessageOptions } from "discord.js";
import Const from "./Const";
import Database from "../database/database";
import { Long } from "mongodb";
import { FreeStuffData, GuildData } from "../types";




export default class MessageDistributor {

  constructor(bot: FreeStuffBot) {
    
  }

  distribute(content: FreeStuffData): void {
    Database
      .collection('guilds')
      .find({ })
      .toArray()
      .then(guilds => {
        if (!guilds) return;
        guilds.forEach(async g => {
          if (!g) return;
          this.sendToGuild(g, content, false, false);
        })
      })
      .catch(console.error);
  }

  test(guild: Guild, content: FreeStuffData): void {
    Database
      .collection('guilds')
      .findOne({ _id: guild.id })
      .then(g => {
        if (!g) return;
        this.sendToGuild(g, content, true, true);
      })
      .catch(console.error);
  }

  async sendToGuild(g: any, content: FreeStuffData, test: boolean, force: boolean) {
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

  buildMessage(content: FreeStuffData, data: GuildData, test: boolean): (string | MessageOptions)[] {
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

  buildTheme1(content: FreeStuffData, data: GuildData, test: boolean): (string | MessageOptions)[] {
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

  buildTheme2(content: FreeStuffData, data: GuildData, test: boolean): (string | MessageOptions)[] {
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

  buildTheme3(content: FreeStuffData, data: GuildData, test: boolean): (string | MessageOptions)[] {
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

  buildTheme4(content: FreeStuffData, data: GuildData, test: boolean): (string | MessageOptions)[] {
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

  buildTheme5(content: FreeStuffData, data: GuildData, test: boolean): (string | MessageOptions)[] {
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

  buildTheme6(content: FreeStuffData, data: GuildData, test: boolean): (string | MessageOptions)[] {
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

  buildTheme7(content: FreeStuffData, data: GuildData, test: boolean): (string | MessageOptions)[] {
    return [
      (data.mentionRoleInstance ? data.mentionRoleInstance.toString() : '')
      + ' ' + content.url,
      {}
    ];
  }

  buildTheme8(content: FreeStuffData, data: GuildData, test: boolean): (string | MessageOptions)[] {
    return [
      (data.mentionRoleInstance ? data.mentionRoleInstance.toString() : '')
      + ` <${content.url}>`,
      {}
    ];
  }

  buildTheme9(content: FreeStuffData, data: GuildData, test: boolean): (string | MessageOptions)[] {
    return [
      (data.mentionRoleInstance ? data.mentionRoleInstance.toString() : '')
      + ` **${content.title}** is free!\n<${content.url}>`,
      {}
    ];
  }

}