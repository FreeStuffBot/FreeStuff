import { GuildData, ReplyableComponentInteraction } from 'cordo'
import { GuildChannel, TextChannel, Webhook } from 'discord.js'
import { Localisation } from '@freestuffbot/common'
import { Core } from '../../../index'
import DatabaseManager from '../../database-manager'
import PermissionStrings from '../../../lib/permission-strings'
import MessageDistributor from '../../message-distributor'
import Experiments from '../../../controller/experiments'


export default async function (i: ReplyableComponentInteraction) {
  if (i.member && !PermissionStrings.containsManageServer(i.member.permissions))
    return i.ack()

  const val = i.data.values[0]
  if (!val) return i.ack()

  const useWebhooks = Experiments.runExperimentOnServer('webhook_migration', i.guildData)

  if (val === '0') {
    DatabaseManager.changeSetting(i.guildData, 'channel', null)
    DatabaseManager.changeSetting(i.guildData, 'webhook', '')
  } else {
    const channel = await Core.channels.fetch(val) as GuildChannel
    if (!channel || (channel.type !== 'GUILD_TEXT' && channel.type !== 'GUILD_NEWS'))
      return i.ack()

    const member = channel.guild.members.resolve(Core.user.id)
    if (!channel.permissionsFor(member)?.has('VIEW_CHANNEL')) {
      i.state('settings_channel', {
        missingPermissions: Localisation.getLine(i.guildData, 'permission_view_channel'),
        changedTo: `<#${val}>`
      })
      return
    }

    if (useWebhooks) {
      const webhookSuccess = await updateWebhook(i.guildData, channel as TextChannel)
      if (!webhookSuccess) {
        i.state('settings_channel', {
          missingPermissions: Localisation.getLine(i.guildData, 'permission_manage_webhooks'),
          changedTo: `<#${val}>`
        })
        return
      }
    }

    DatabaseManager.changeSetting(i.guildData, 'channel', channel.id)
  }

  i.state('settings_channel')
}

async function updateWebhook(guildData: GuildData, channel: TextChannel): Promise<boolean> {
  const member = channel.guild.members.resolve(Core.user.id)
  if (!channel.permissionsFor(member).has('MANAGE_WEBHOOKS'))
    return false

  let webhook = await MessageDistributor.findWebhook(channel)
  if (webhook) {
    DatabaseManager.changeSetting(guildData, 'webhook', `${webhook.id}/${webhook.token}`)
    return true
  }

  webhook = <Webhook> (await MessageDistributor.createWebhook(guildData, channel, false)) ?? null
  if (webhook) {
    DatabaseManager.changeSetting(guildData, 'webhook', `${webhook.id}/${webhook.token}`)
    return true
  }

  return false
}
