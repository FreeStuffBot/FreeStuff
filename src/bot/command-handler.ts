import { FreeStuffBot, config, Core } from "../index";
import { Message } from "discord.js";
import Const from "./const";
import { Command, GuildData } from "../types";
import HelpCommand from "./commands/help";
import InfoCommand from "./commands/info";
import InviteCommand from "./commands/invite";
import SettingsCommand from "./commands/settings";
import TestCommand from "./commands/test";
import VoteCommand from "./commands/vote";
import CheckCommand from "./commands/check";
import HereCommand from "./commands/here";
import FreeCommand from "./commands/free";


export default class CommandHandler {

  public readonly commands: Command[] = [];

  public constructor(bot: FreeStuffBot) {
    this.commands.push(new HelpCommand());
    this.commands.push(new InfoCommand());
    this.commands.push(new InviteCommand());
    this.commands.push(new SettingsCommand());
    this.commands.push(new TestCommand());
    this.commands.push(new VoteCommand());
    this.commands.push(new CheckCommand());
    this.commands.push(new HereCommand());
    this.commands.push(new FreeCommand());

    bot.on('message', m => {
      if (m.author.bot) return;
      if (!m.guild) return;
      if (!m.content.replace('!', '').startsWith(bot.user.toString())
        && !m.content.toLowerCase().startsWith('@freestuff')) return;
      if (!m.guild.me.permissionsIn(m.channel).has('SEND_MESSAGES')) return;

      const args = m.content.split(' ');
      args.splice(0, 1);
      Core.databaseManager.getGuildData(m.guild).then(g => {
        this.handleCommand(args.splice(0, 1)[0] || '', args, m, g).then(success => {
          if (!success && m.guild.me.permissionsIn(m.channel).has('ADD_REACTIONS'))
            m.react('🤔');
        }).catch(e => { });
      }).catch(err => {
        try {
          // no translaton in case the above failes due to language manager issues
          m.reply(`An error occured! Please try again later. If this error persists, try removing the bot from your server and adding it back up. For additional support visit our support server: ${Const.discordInvite}`);
        } catch(ex) { }
      });
    });
  }

  public async handleCommand(command: string, args: string[], orgmes: Message, g: GuildData): Promise<boolean> {
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
      const langNotif = g.language.startsWith('en')
        ? (Core.localisation.getTranslationHint(orgmes.guild) && orgmes.member.hasPermission('MANAGE_GUILD'))
          ? '\n\n' + Core.localisation.getTranslationHint(orgmes.guild)
          : ''
        : '\n\n' + Core.text(g, '=cmd_freestuff_2_en', { website: Const.websiteLink });
      reply(
        Core.text(g, '=cmd_freestuff_1', { username: orgmes.author.username }),
        Core.text(g, '=cmd_freestuff_2', { website: Const.websiteLink }) + langNotif
      );
      return true;
    }
    const egg = this.eastereggs([command, ...args].join(' '));
    if (egg != '') {
      orgmes.channel.send(egg);
      return true;
    }

    //

    const handler = this.commands.find(c => c.info.trigger.includes(command.toLowerCase()));
    if (!handler) {
      if (/set.*/.test(command.toLowerCase())) {
        reply(
          Core.text(g, '=cmd_missing_space_1', { command: command.toLowerCase().substr(3)}),
          Core.text(g, '=cmd_missing_space_2')
        );
        return true;
      }
      return false;
    }

    if (handler.info.serverManagerOnly) {
      if (!orgmes.member.hasPermission('MANAGE_GUILD') && !config.admins.includes(orgmes.member.id)) {
        reply(
          Core.text(g, '=cmd_no_permission_1', { command: command.toLowerCase().substr(3)}),
          Core.text(g, '=cmd_no_permission_2'),
          undefined,
          undefined,
          'https://media.discordapp.net/attachments/672907465670787083/672907481957007400/unknown.png'
        );
        return true;
      }
    }

    if (handler.info.adminOnly) {
      reply('TODO', 'TODO TODO TODO @Maanex');
      return true;
    }

    let back = handler.handle(orgmes, args, g, reply);
    if (back['then']) back = await (back as Promise<boolean>);
    return back as boolean;
  }

  private eastereggs(command: string): String {
    switch (command.toLowerCase()) {
      case 'egg': return ':egg:';
      case 'what is 1 + 1': return '3';
      case 'do a barrel roll': return 'no';
      case 'why are you running?': return ':eyes:';
      case 'is gay': return 'no u';
      case 'sucks': return 'no u';
      case 'is bad': return 'no u';
      case 'is cool': return ':sunglasses:';
      case 'is awesome': return ':sunglasses:';
      case 'is amazing': return ':sunglasses:';
      case 'easteregg': return ':eyes:';

      default: return '';
    }
  }

}