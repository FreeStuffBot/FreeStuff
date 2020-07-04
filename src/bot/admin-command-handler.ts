import { FreeStuffBot, Core, config } from "../index";
import { Message } from "discord.js";
import Database from "../database/database";
import { GuildData } from "types";
import * as AsciiTable from "ascii-table";
import { hostname } from "os";
import { Long } from "mongodb";

/*

THIS CLASS CLEARLY NEEDS SOME CLEANUP

*/


const commandlist = [
  '`$FreeStuff help` - Shows this help page',
  '`$FreeStuff print` - Shows info about this guild',
  '`$FreeStuff guildlist` - Shows a list of all guilds this bot is on',
  '`$FreeStuff stats` - Shows some stats',
];

export default class AdminCommandHandler {

  public constructor(bot: FreeStuffBot) {
    bot.on('message', m => {
      if (m.author.bot) return;
      if (!m.guild) return;
      if (!m.content.toLowerCase().startsWith(Core.devMode ? '$kabi' : '$freestuff')) return;
      if (!m.guild.me.permissionsIn(m.channel).has('SEND_MESSAGES')) return;
      if (!config.admins.includes(m.author.id)) return;

      const args = m.content.split(' ');
      args.splice(0, 1);
      const success = this.handleCommand(args.splice(0, 1)[0] || '', args, m);
      if (!success && m.guild.me.permissionsIn(m.channel).has('ADD_REACTIONS'))
        m.react('🤔');
    });
  }

  public handleCommand(command: string, args: string[], orgmes: Message): boolean {
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
            .findOne({ _id: Long.fromString(orgmes.guild.id) })
            .then(async data => {
              data['_'] = {
                responsibleShard: Core.singleShard ? 'Single' : Core.options.shardId,
                runningOnServer: await hostname(),
              }
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
          const list = Core.guilds.array().sort((a, b) => b.memberCount - a.memberCount);
          while (out.length < 1900 && remaining) {
            let guild = list[i++];
            out += `${guild.name} - ${guild.memberCount}\n`;
            remaining = Core.guilds.size - i;
          }
          if (remaining) {
            out += `\n\n+ ${remaining} more...`;
          }
          orgmes.channel.send(out + '```');
          return true;

        case 'stats': 
          Database
            .collection('guilds')
            .find({ })
            .toArray()
            .then(a => {
              const guildData: GuildData[] = a.map(Core.databaseManager.parseGuildData);
              let total = guildData.length;
              let channelSet = 0;
              let dollar = 0;
              let react = 0;
              let roleMention = 0;
              let trashGames = 0;
              let priceChanged = 0;
              let themes = [];
              for (let i = 0; i < 16; i++) themes.push(0);

              for (const data of guildData) {
                if (data.channelInstance) channelSet++;
                if (data.currency == 'usd') dollar++;
                if (data.react) react++;
                if (data.roleInstance) roleMention++;
                if (data.trashGames) trashGames++;
                if (data.price !== 3) priceChanged++;
                themes[data.theme]++;
              }
  
              let round = (a) => Math.round(a*1000)/10;

              let table = new AsciiTable();
              table.setHeading('changed to', 'amount', 'changed%', 'amount', 'default');
              table.addRow('channel set',   channelSet,   round(channelSet   / total) + '%', total - channelSet,   'not set');
              table.addRow('dollar',        dollar,       round(dollar       / total) + '%', total - dollar,       'euro');
              table.addRow('react',         react,        round(react        / total) + '%', total - react,        'dont react');
              table.addRow('mention',       roleMention,  round(roleMention  / total) + '%', total - roleMention,  'dont mention');
              table.addRow('trash',         trashGames,   round(trashGames   / total) + '%', total - trashGames,   'no trash');
              table.addRow('price changed', priceChanged, round(priceChanged / total) + '%', total - priceChanged, '3€ price');

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

};
