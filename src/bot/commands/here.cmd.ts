import { Message, Webhook, WebhookClient } from "discord.js";
import { ReplyFunction, Command } from "../../types";
import { Core, config } from "../../index";


export default class HereCommand extends Command {

  public constructor() {
    super({
      name: 'here',
      desc: 'Only execute this command when prompted to do so by the FreeStuff support team!',
      trigger: [ 'here' ],
      hideOnHelp: true
    });
  }

  public async handle(mes: Message, args: string[], repl: ReplyFunction): Promise<boolean> {
    const guild = mes.guild;
    let userPermissions = [];
    if (mes.member.hasPermission('ADMINISTRATOR')) userPermissions.push('Admin');
    if (mes.member.hasPermission('MANAGE_GUILD')) userPermissions.push('Manage Guild');
    if (mes.member.hasPermission('MANAGE_MESSAGES')) userPermissions.push('Manage Messages');
    if (mes.member.hasPermission('MANAGE_CHANNELS')) userPermissions.push('Manage Channels');
    const guildInfo = `
      Name: ${guild.name}
      Region: ${guild.region}
      Members: ${guild.memberCount},
      Features: ${guild.features.join(', ')}
      User's Permissions: ${userPermissions.join(', ')}
      User Owner?: ${guild.ownerID == mes.author.id}`;
    const guildData = await Core.databaseManager.getRawGuildData(guild);
    const permissionCheck = guildData.channel
      ? (() => {
          const perms = guild.me.permissionsIn(guild.channels.get(guildData.channel.toString()));
          const out = [];
          out.push(perms.has('READ_MESSAGES') ? 'Can read messages' : 'CANNOT READ MESSAGES');
          out.push(perms.has('SEND_MESSAGES') ? 'Can send messages' : 'CANNOT SEND MESSAGES');
          out.push(perms.has('EMBED_LINKS') ? 'Can embed links' : 'CANNOT EMBED LINKS');
          out.push(perms.has('EXTERNAL_EMOJIS') ? 'Can use external emotes' : 'CANNOT USE EXTERNAL EMOTES');
          return out.join('\n');
        })()
      : 'No channel set!';

    guildData['_currency'] = (guildData.settings & 0b10000) == 0 ? 'euro' : 'usd';
    guildData['_react'] = (guildData.settings & 0b100000) != 0;
    guildData['_trashGames'] = (guildData.settings & 0b1000000) != 0;
    guildData['_theme'] = guildData.settings & 0b1111;

    const webhook = new WebhookClient(config.supportWebhook.id, config.supportWebhook.token);
    webhook.send('', {
      username: mes.author.tag,
      avatarURL: mes.author.avatarURL,
      embeds: [{
        title: '@FreeStuff here',
        fields: [
          {
            name: 'Guild Info',
            value: guildInfo
          },
          {
            name: 'Guild Data',
            value: `\`\`\`json\n${JSON.stringify(guildData, null, 2)}\`\`\``
          },
          {
            name: 'Permission Check',
            value: permissionCheck
          }
        ]
      }]
    })

    repl('Alright thank you!', 'We will investigate your issue, hold on a bit...');
    return true;
  }

}