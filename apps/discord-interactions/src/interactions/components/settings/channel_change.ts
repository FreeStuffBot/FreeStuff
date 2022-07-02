import { ChannelType, ReplyableComponentInteraction } from 'cordo'
import { CustomPermissions, Errors, Localisation } from '@freestuffbot/common'
import PermissionStrings from 'cordo/dist/lib/permission-strings'
import { Long } from 'bson'
import DiscordGateway from '../../../services/discord-gateway'
import Webhooks from '../../../lib/webhooks'


export default async function (i: ReplyableComponentInteraction) {
  if (i.member && !PermissionStrings.containsManageServer(i.member.permissions))
    return i.ack()

  const val = i.data.values[0]
  if (!val) return i.ack()

  if (val === '0') {
    i.guildData.changeSetting('channel', null)
    i.guildData.changeSetting('webhook', '')
    i.state('settings_channel')
    return
  }

  // fetch channels
  const [ channelError, allChannels ] = await DiscordGateway.getChannels(i.guild_id)
  if (channelError) return Errors.handleErrorAndCommunicate(channelError, i)

  // find channel and return if invalid
  const channel = allChannels.find(c => c.id === val)
  if (!channel || (channel.type !== ChannelType.GUILD_TEXT && channel.type !== ChannelType.GUILD_NEWS))
    return i.ack()

  // check for view channel permissions
  const permissions = CustomPermissions.parseChannel(channel.permissions)
  if (!permissions.viewChannel) {
    i.state('settings_channel', {
      missingPermissions: Localisation.getLine(i, 'permission_view_channel'),
      changedTo: `<#${val}>`
    })
    return
  }

  // do webhook magic
  const [ webhookError, webhook ] = await Webhooks.updateWebhook(channel)
  if (webhookError) {
    if (webhookError.status === Errors.STATUS_MISPERM_WEBHOOKS) {
      i.state('settings_channel', {
        missingPermissions: Localisation.getLine(i, 'permission_manage_webhooks'),
        changedTo: `<#${val}>`
      })
      return
    }

    if (webhookError.status === Errors.HTTP_STATUS_CONFLICT) {
      i.state('settings_channel', {
        conflict: Localisation.text(i, 'settings_channel_error_too_many_webhooks', { channel: `<#${val}>` })
      })
      return
    }

    i.state('settings_channel')
    i.replyPrivately(Errors.handleErrorAndCommunicate(webhookError))
    return
  }

  // success!
  i.guildData.changeSetting('webhook', `${webhook.id}/${webhook.token}`)
  i.guildData.changeSetting('channel', Long.fromString(channel.id))
  i.state('settings_channel')
}

