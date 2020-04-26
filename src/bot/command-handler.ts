import { FreeStuffBot, config } from "../index";
import { Message } from "discord.js";
import Const from "./const";
import { Command } from "../types";
import HelpCommand from "./commands/help.cmd";
import InfoCommand from "./commands/info.cmd";
import InviteCommand from "./commands/invite.cmd";
import SettingsCommand from "./commands/settings.cmd";
import TestCommand from "./commands/test.cmd";
import VoteCommand from "./commands/vote.cmd";


export default class CommandHandler {

  public readonly commands: Command[] = [];

  public constructor(bot: FreeStuffBot) {
    this.commands.push(new HelpCommand());
    this.commands.push(new InfoCommand());
    this.commands.push(new InviteCommand());
    this.commands.push(new SettingsCommand());
    this.commands.push(new TestCommand());
    this.commands.push(new VoteCommand());

    bot.on('message', m => {
      if (m.author.bot) return;
      if (!m.guild) return;
      if (!m.content.replace('!', '').startsWith(bot.user.toString()) && !m.content.toLowerCase().startsWith('@freestuff')) return;
      if (!m.guild.me.permissionsIn(m.channel).has('SEND_MESSAGES')) return;

      const args = m.content.split(' ');
      args.splice(0, 1);
      this.handleCommand(args.splice(0, 1)[0] || '', args, m).then(success => {
        if (!success && m.guild.me.permissionsIn(m.channel).has('ADD_REACTIONS'))
          m.react('🤔');
      }).catch(e=>{});
    });
  }

  public async handleCommand(command: string, args: string[], orgmes: Message): Promise<boolean> {
    const reply = (message: string, content: string, footer?: string, color?: number, image?: string) => {
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
        }});
      } else {
        orgmes.channel.send(`**${message}**\n${content}`);
      }
    };

    //

    if (command == '') {
      reply(`Hey ${orgmes.author.username}!`, 'Type `@FreeStuff help` for a help page!\nType `@FreeStuff info` for information about the bot!\n[Or click here for more info](' + Const.websiteLink + ')');
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
      if (!orgmes.member.hasPermission('MANAGE_GUILD') && !config.admins.includes(orgmes.member.id)) {
        reply('No permission!', 'You need the `manage server` permission to do that!', undefined, undefined, 'https://media.discordapp.net/attachments/672907465670787083/672907481957007400/unknown.png');
        return true;
      }
    }

    if (handler.info.adminOnly) {
      reply('TODO', 'TODO TODO TODO @Maanex');
      return true;
    }

    let back = handler.handle(orgmes, args, reply);
    if (back['then']) back = await (back as Promise<boolean>);
    return back as boolean;
  }

}