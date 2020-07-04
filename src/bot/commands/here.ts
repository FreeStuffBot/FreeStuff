import { Message, WebhookClient } from "discord.js";
import { ReplyFunction, Command, GuildData } from "../../types";
import { Core, config } from "../../index";


export default class HereCommand extends Command {

  public constructor() {
    super({
      name: 'here',
      desc: '=cmd_here_desc',
      trigger: [ 'here' ],
      hideOnHelp: true
    });
  }

  public async handle(mes: Message, args: string[], g: GuildData, repl: ReplyFunction): Promise<boolean> {
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
    const permissionCheck = g?.channel
      ? (() => {
          const perms = guild.me.permissionsIn(guild.channels.get(g.channel.toString()));
          const out = [];
          out.push(perms.has('READ_MESSAGES') ? 'Can read messages' : 'CANNOT READ MESSAGES');
          out.push(perms.has('SEND_MESSAGES') ? 'Can send messages' : 'CANNOT SEND MESSAGES');
          out.push(perms.has('EMBED_LINKS') ? 'Can embed links' : 'CANNOT EMBED LINKS');
          out.push(perms.has('EXTERNAL_EMOJIS') ? 'Can use external emotes' : 'CANNOT USE EXTERNAL EMOTES');
          return out.join('\n');
        })()
      : 'No channel set!';

    let gd = JSON.parse(JSON.stringify(g));
    if (gd) {
      delete gd['channelInstance'];
      delete gd['roleInstance'];
    }

    let guilddata = `\`\`\`json\n${JSON.stringify(gd || { error: 'Guild Data Error' }, null, 2)}\`\`\``;
    if (guilddata.length > 1024) guilddata = `\`\`\`json\n${JSON.stringify(gd || { error: 'Guild Data Error' }, null, 1)}\`\`\``
    if (guilddata.length > 1024) guilddata = `\`\`\`json\n${JSON.stringify(gd || { error: 'Guild Data Error' })}\`\`\``
    if (guilddata.length > 1024) {
      console.log(JSON.stringify(gd, null, 2));
      guilddata = 'Guild data too long. Check logs.'
    }

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
            value: guilddata
          },
          {
            name: 'Permission Check',
            value: permissionCheck
          }
        ]
      }]
    })

    repl(
      Core.text(g, '=cmd_here_1'),
      Core.text(g, '=cmd_here_2')
    );
    return true;
  }

}