import { ChannelType, ReplyableComponentInteraction } from 'cordo'
import { CustomPermissions, Errors, Localisation } from '@freestuffbot/common'
import PermissionStrings from 'cordo/dist/lib/permission-strings'
import { Long } from 'bson'
import DiscordGateway from '../../../services/discord-gateway'
import Webhooks from '../../../lib/webhooks'


const allowedParentTypes = [
  ChannelType.GUILD_TEXT,
  ChannelType.GUILD_NEWS,
  ChannelType.GUILD_FORUM
]

const allowedChannelTypes = [
  ChannelType.GUILD_TEXT,
  ChannelType.GUILD_NEWS,
  ChannelType.GUILD_PUBLIC_THREAD,
  ChannelType.GUILD_NEWS_THREAD
]

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

  // just in case the id is malformed as the requested is passed to the gateway
  if (!/^\d{9,50}$/.test(val))
    return i.state('settings_channel')

  // fetch channels
  const [ channelError, allChannels ] = await DiscordGateway.getChannels(i.guild_id, val)
  if (channelError) return Errors.handleErrorAndCommunicate(channelError, i)

  // find channel and return if invalid
  const channel = allChannels.find(c => c.id === val)
  if (!channel || !allowedChannelTypes.includes(channel.type))
    return i.state('settings_channel')

  // check for view channel permissions
  const permissions = CustomPermissions.parseChannel(channel.permissions)
  if (!permissions.viewChannel) {
    i.state('settings_channel', {
      missingPermissions: Localisation.getLine(i, 'permission_view_channel'),
      changedTo: `<#${val}>`
    })
    return
  }

  // if the channel is a thread, we need to find the parent channel
  const parent = channel.parentId
    ? allChannels.find(c => c.id === channel.parentId)
    : null

  // use parent if valid (eg parent = forum), or channel if not (eg parent = category)
  const webhookTargetChannel = (parent && allowedParentTypes.includes(parent.type))
    ? parent
    : channel

  // do webhook magic
  const [ webhookError, webhook ] = await Webhooks.updateWebhook(webhookTargetChannel)
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
  const webhookData = parent
    ? `${webhook.id}/${webhook.token}:${channel.id}`
    : `${webhook.id}/${webhook.token}`
  i.guildData.changeSetting('webhook', webhookData)
  i.guildData.changeSetting('channel', Long.fromString(channel.id))
  i.state('settings_channel')
}

