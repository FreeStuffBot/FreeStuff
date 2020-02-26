import { FreeStuffBot, Core } from "../index";
import { Message } from "discord.js";
import Const from "./const";
import Database from "../database/database";
import WebScraper from "../web_scraper/scraper";

const AsciiTable = require('ascii-table');
const settings = require('../../config/settings.json');



const commandlist = [
  '`$FreeStuff help` - Shows this help page',
  '`$FreeStuff print` - Shows info about this guild',
  '`$FreeStuff guildlist` - Shows a list of all guilds this bot is on',
  '`$FreeStuff scrape <url> [--confirm]` - Scrapes a webstore to fetch the data. Use --confirm to publish to all guilds.',
  '`$FreeStuff stats` - Shows some stats',
];

export default class AdminCommandHandler {

  constructor(bot: FreeStuffBot) {
    bot.on('message', m => {
      if (m.author.bot) return;
      if (!m.guild) return;
      if (!m.content.toLowerCase().startsWith('$freestuff')) return;
      if (!m.guild.me.permissionsIn(m.channel).has('SEND_MESSAGES')) return;
      if (!settings.admins.includes(m.author.id)) return;

      let args = m.content.split(' ');
      args.splice(0, 1);
      let success = this.handleCommand(args.splice(0, 1)[0] || '', args, m);
      if (!success && m.guild.me.permissionsIn(m.channel).has('ADD_REACTIONS'))
        m.react('🤔');
    });
  }

  handleCommand(command: string, args: string[], orgmes: Message): boolean {
    let reply = (message: string, content: string, footer?: string, color?: number, image?: string) => {
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
      }})
    };

    switch (command.toLowerCase()) {
      case 'help':
        reply('Help is on the way!', 'Available commands:\n' + commandlist.map(c => `• ${c}`).join('\n'));
        return true;

        case 'print':
          Database
            .collection('guilds')
            .findOne({ _id: orgmes.guild.id })
            .then(data => {
              orgmes.channel.send('```json\n' + JSON.stringify(data, null, 2) + '```');
            })
            .catch(console.error);
          return true;

        case 'guildlist':
          let out = ''
          + `**Guilds:** ${Core.guilds.size}\n`
          + `**Total Members:** ${Core.guilds.array().count(g => g.memberCount)}\n`
          + `\`\`\`\n`;
          let i = 0;
          let remaining = Core.guilds.size - i;
          while (out.length < 1900 && remaining) {
            let guild = Core.guilds.array()[i++];
            out += `${guild.name} - ${guild.memberCount}\n`;
            remaining = Core.guilds.size - i;
          }
          if (remaining) {
            out += `\n\n+ ${remaining} more...`;
          }
          orgmes.channel.send(out + '```');
          return true;

        case 'scrape':
          if (!args.length) {
            reply('Huh', 'Missing args[0] - store URL');
            return false;
          }

          WebScraper
            .fetch(args[0])
            .then(d => {
              Core.messageDistributor.sendToGuild(orgmes.guild, d, false);
            })
            .catch(err => {
              reply('Error', '```' + err + '```');
              console.error(err);
            })
          return true;

        case 'stats': 
          Database
            .collection('guilds')
            .find({ })
            .toArray()
            .then(a => {
              const guildData = a.map(Core.databaseManager.parseGuildData);
              let total = guildData.length;
              let channelSet = 0;
              let euro = 0;
              let react = 0;
              let roleMention = 0;
              let themes = [];
              for (let i = 0; i < 16; i++) themes.push(0);

              for (let data of guildData) {
                if (data.channelInstance) channelSet++;
                if (data.currency == 'euro') euro++;
                if (data.react) react++;
                if (data.mentionRoleInstance) roleMention++;
                themes[data.theme]++;
              }
  
              let round = (a) => Math.round(a*1000)/10;

              let table = new AsciiTable();
              table.setHeading('value', 'amount', 'l%', 'amount', 'value');
              table.addRow('channel set', channelSet,  round(channelSet  / total) + '%', total - channelSet,  'not set');
              table.addRow('euro',        euro,        round(euro        / total) + '%', total - euro,        'dollar');
              table.addRow('react',       react,       round(react       / total) + '%', total - react,       'don\'t react');
              table.addRow('mention',     roleMention, round(roleMention / total) + '%', total - roleMention, 'don\'t mention');

              let themeStr = 'Themes:';
              for (let i = 0; i < 16; i++)
                themeStr += `\n• Theme ${i+1}: ${themes[i]} guilds`;
              reply('The stats', '```' + table.toString() + '\n\n' + themeStr + '```');
            })
            .catch(err => {
              reply('Error', '```' + err + '```');
              console.error(err);
            });
          return true;
    }

    return false;
  }

}