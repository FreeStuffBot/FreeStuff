import { FreeStuffBot, Core, config } from "../index";
import { Message } from "discord.js";
import Database from "../database/database";
import { GameData, DatabaseGuildData } from "types";
import { hostname } from "os";
import { Long } from "mongodb";

/*

THIS CLASS CLEARLY NEEDS SOME CLEANUP

*/


const commandlist = [
  '`$FreeStuff help` - Shows this help page',
  '`$FreeStuff print` - Shows info about this guild',
  '`$FreeStuff distribute` - ',
  '`$FreeStuff settingbits` - ',
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
      if (!success
        && m.guild.me.permissionsIn(m.channel).has('ADD_REACTIONS')
        && m.guild.me.permissionsIn(m.channel).has('READ_MESSAGE_HISTORY')) {
        m.react('🤔');
      }
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
                responsibleShard: Core.singleShard ? 'Single' : Core.options.shards[0],
                runningOnServer: await hostname(),
              }
              orgmes.channel.send('```json\n' + JSON.stringify(data, null, 2) + '```');
            })
            .catch(console.error);
          return true;

        case 'distribute':
          if (args.length < 3) {
            reply('no', '$FreeStuff distribute <gameid> <serverid> [...serverid]');
            return;
          }
          Database
            .collection('games')
            .findOne({ _id: parseInt(args[1], 10) })
            .then(async (data: GameData) => {
              args.splice(0, 2);
              for (let guildid of args) {
                const guild = await Database
                  .collection('guilds')
                  .findOne({ _id: Long.fromString(guildid) }) as DatabaseGuildData;
                Core.messageDistributor.sendToGuild(guild, [ data.info ], false, false);
              }
            })
            .catch(err => reply('error', err));
          return true;

        case 'settingbits':
          Core.databaseManager.getRawGuildData(orgmes.guild.id).then(d => {
            orgmes.channel.send([
              '```',
              '._______________._______.___._..',
              d.settings.toString(2).padStart(32, '0'),
              '          ┖──┬───┚┖─┬──┚╿╿╿╿┖┬─┚',
              '             G      F   EDCB A  ',
              '',
              'A) Theme  B) Currency  C) Reaction',
              'D) Trash Games  E) Alt Date Format',
              'F) Language  G) Stores',
              '```'
            ].join('\n'))
          }).catch(orgmes.reply);
        return true;
    }

    return false;
  }

};
