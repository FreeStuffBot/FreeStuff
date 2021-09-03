import { Message, WebhookClient } from 'discord.js'
import { GuildData } from '../../types/datastructs'
import { Command, ReplyFunction } from '../../types/commands'
import { Core, config } from '../../index'
import Logger from '../../lib/logger'
import RemoteConfig from '../../controller/remote-config'
import guildDataToViewString from '../../lib/guilddata-visualizer'


export default class HereCommand extends Command {

  public constructor() {
    super({
      name: 'here',
      desc: '=cmd_here_desc',
      trigger: [ 'here' ],
      hideOnHelp: true
    })
  }

  public handle(mes: Message, _args: string[], g: GuildData, repl: ReplyFunction): boolean {
    const webhookId = RemoteConfig.get().support_webhook_id || config.supportWebhook?.id
    const webhookToken = RemoteConfig.get().support_webhook_token || config.supportWebhook?.token
    if (!webhookId || !webhookToken) {
      Logger.warn('Someone tried to use the /here command but your support webhook is not set up!')
      return false
    }

    const guild = mes.guild
    const userPermissions = []
    if (mes.member.permissions.has('ADMINISTRATOR')) userPermissions.push('Admin')
    if (mes.member.permissions.has('MANAGE_GUILD')) userPermissions.push('Manage Guild')
    if (mes.member.permissions.has('MANAGE_MESSAGES')) userPermissions.push('Manage Messages')
    if (mes.member.permissions.has('MANAGE_CHANNELS')) userPermissions.push('Manage Channels')

    const guildInfo = `
      Name: ${guild.name}
      Members: ${guild.memberCount},
      Features: ${guild.features.join(', ')}
      User's Permissions: ${userPermissions.join(', ')}
      User Owner?: ${guild.ownerId === mes.author.id}`

    const permissionCheck = g?.channel
      ? (() => {
          const perms = guild.me?.permissionsIn(guild.channels.resolve(g.channel.toString()))
          if (!perms) return 'nah mate, nahh'
          const out = []
          out.push(perms.has('VIEW_CHANNEL') ? 'Can view channel' : 'CANNOT VIEW CHANNEL')
          out.push(perms.has('SEND_MESSAGES') ? 'Can send messages' : 'CANNOT SEND MESSAGES')
          out.push(perms.has('EMBED_LINKS') ? 'Can embed links' : 'CANNOT EMBED LINKS')
          out.push(perms.has('USE_EXTERNAL_EMOJIS') ? 'Can use external emotes' : 'CANNOT USE EXTERNAL EMOTES')
          return out.join('\n')
        })()
      : 'No channel set!'

    const guilddata = guildDataToViewString(g, 2048, undefined, true)

    const webhook = new WebhookClient(webhookId, webhookToken)
    webhook.send({
      username: mes.author.tag,
      avatarURL: mes.author.avatarURL(),
      embeds: [ {
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
      } ]
    })

    repl(
      Core.text(g, '=cmd_here_1'),
      Core.text(g, '=cmd_here_2')
    )
    return true
  }

}
