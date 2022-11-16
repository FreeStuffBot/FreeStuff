import { ButtonStyle, ChannelType, ComponentType, GenericInteraction, InteractionApplicationCommandCallbackData, InteractionComponentFlag, MessageComponentSelectOption } from 'cordo'
import { Localisation, Emojis, CustomPermissions, DataChannel, SanitizedGuildType, Errors, Experiments } from '@freestuffbot/common'
import PermissionStrings from 'cordo/dist/lib/permission-strings'
import { CustomChannelPermissions } from '@freestuffbot/common/dist/lib/custom-permissions'
import Tracker from '../../../lib/tracker'
import DiscordGateway from '../../../services/discord-gateway'


type Options = {
  missingPermissions?: string,
  conflict?: string,
  changedTo?: string,
  ignoreCache?: boolean
}

//

const recommendedChannelRegex = /free|game|gaming|deal/i
const filterOutChannelRegex1 = /rule|meme|support/i
const filterOutChannelRegex2 = /log|help|selfies/i
const filterOutChannelRegex3 = /team|partner|suggestion/i
const highProbChannelRegex = /announcement|new|general|computer|play|important|feed|bot|commands/i
const sussyRegex = /(^|-|_)(sus(sy)?|amon?g-?_?us)($|-|_)/i

function isRecommended(i: GenericInteraction, c: DataChannel) {
  return recommendedChannelRegex.test(c.name) || i.channel_id === c.id
}

const allowedChannelTypes = [
  ChannelType.GUILD_TEXT,
  ChannelType.GUILD_NEWS,
  ChannelType.GUILD_PUBLIC_THREAD,
  ChannelType.GUILD_NEWS_THREAD
]

export default async function (i: GenericInteraction, [ opts ]: [ Options ]): Promise<InteractionApplicationCommandCallbackData> {
  const [ err, guildData ] = await i.guildData.fetch()
  if (err) return Errors.handleErrorAndCommunicate(err)

  Tracker.set(guildData, 'PAGE_DISCOVERED_SETTINGS_CHANGE_CHANNEL')

  // we don't know if the current channel is a thread so we just always look it up in case it is
  const lookupThreads = Experiments.runExperimentOnServer('allow_thread_channels', guildData)
    ? [ i.channel_id, guildData.channel?.toString() ].filter(Boolean)
    : null
  const [ error, allChannels ] = await DiscordGateway.getChannels(i.guild_id, lookupThreads, !!opts?.ignoreCache)
  if (error) return Errors.handleErrorAndCommunicate(error)

  let youHaveTooManyChannelsStage = 0
  let channelsFound = allChannels
    .filter(c => allowedChannelTypes.includes(c.type))

  // ah dang list is too long, let's start filtering some out
  if (channelsFound.length > 24) {
    channelsFound = channelsFound.filter(c => !c.nsfw || isRecommended(i, c))
    youHaveTooManyChannelsStage++
  }
  if (channelsFound.length > 24) {
    channelsFound = channelsFound.filter(c => CustomPermissions.parseChannel(c.permissions).viewChannel || isRecommended(i, c))
    youHaveTooManyChannelsStage++
  }
  if (channelsFound.length > 24) {
    channelsFound = channelsFound.filter(c => !filterOutChannelRegex1.test(c.name) || isRecommended(i, c))
    youHaveTooManyChannelsStage++
  }
  if (channelsFound.length > 24) {
    channelsFound = channelsFound.filter(c => !filterOutChannelRegex2.test(c.name) || isRecommended(i, c))
    youHaveTooManyChannelsStage++
  }
  if (channelsFound.length > 24) {
    channelsFound = channelsFound.filter(c => !filterOutChannelRegex3.test(c.name) || isRecommended(i, c))
    youHaveTooManyChannelsStage++
  }
  if (channelsFound.length > 24) {
    channelsFound = channelsFound.filter(c => highProbChannelRegex.test(c.name) || isRecommended(i, c))
    youHaveTooManyChannelsStage++
  }

  const hereText = ` (${Localisation.text(i, '=settings_channel_list_here')})`

  const parentOrder = new Map()
  parentOrder.set(null, 0)
  for (const channel of allChannels) {
    if (channel.type === ChannelType.GUILD_CATEGORY)
      parentOrder.set(channel.id, channel.position)
  }

  const channels = channelsFound
    .sort((a, b) => sortChannels(a, b, i, parentOrder))
    .slice(0, 24)
    .map(c => channelToDropdownOption(c, i, guildData, hereText))

  const options: MessageComponentSelectOption[] = [
    {
      label: '=settings_channel_list_no_channel_1',
      value: '0',
      default: !guildData.channel,
      description: '=settings_channel_list_no_channel_2',
      emoji: Emojis.no.toObject()
    },
    ...channels
  ]

  let description = Localisation.text(i, '=settings_channel_ui_2_regular')
  if (youHaveTooManyChannelsStage > 2)
    description = Localisation.text(i, '=settings_channel_ui_2_way_too_many') + '\n\n*' + Localisation.text(i, '=settings_channel_ui_too_many_channels_tip') + '*'
  else if (youHaveTooManyChannelsStage > 0)
    description = Localisation.text(i, '=settings_channel_ui_2_too_many') + '\n\n*' + Localisation.text(i, '=settings_channel_ui_too_many_channels_tip') + '*'

  if (opts?.missingPermissions)
    description += `\n\n⚠️ **${Localisation.text(i, '=settings_channel_ui_missing_permissions', { channel: opts?.changedTo, permissions: opts?.missingPermissions })}**`
  else if (opts?.conflict)
    description += `\n\n⚠️ **${opts.conflict}**`

  return {
    title: '=settings_channel_ui_1',
    description,
    components: [
      {
        type: ComponentType.SELECT,
        custom_id: 'settings_channel_change',
        placeholder: '=settings_channel_unknown_channel',
        options,
        flags: [ InteractionComponentFlag.ACCESS_MANAGE_SERVER ]
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'settings_main',
        label: '=generic_back',
        emoji: Emojis.caretLeft.toObject()
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'meta_refresh_channels',
        label: '=refresh_channel_list'
      }
    ],
    footer: PermissionStrings.containsManageServer(i.member.permissions) ? '' : '=settings_permission_disclaimer'
  }
}


/**
 * Compares two channels for their order in discord
 */
function sortChannels(a: DataChannel, b: DataChannel, i: GenericInteraction, parentOrder: Map<string, number>): number {
  return (isRecommended(i, a) ? -1000 : 0)
    - (isRecommended(i, b) ? -1000 : 0)
    + (a.position + (parentOrder.get(a.parentId) ?? 0) * 100)
    - (b.position + (parentOrder.get(b.parentId) ?? 0) * 100)
}


/**
 * Converts a channel object to a dropdown option
 */
function channelToDropdownOption(c: DataChannel, i: GenericInteraction, guildData: SanitizedGuildType, hereText: string): MessageComponentSelectOption {
  const permissions = CustomPermissions.parseChannel(c.permissions)
  const sussy = sussyRegex.test(c.name)
  const recommended = isRecommended(i, c)

  const description = getDescriptionForChannel(i, permissions, sussy)

  const label = (c.id === i.channel_id) && (c.name.length + hereText.length <= 25)
    ? c.name.split('\\').join('') + hereText
    : sanitizeChannelName(c.name, 25)

  const emoji = getEmojiForChannel(recommended, c.type, sussy)

  return {
    label,
    value: c.id,
    default: guildData.channel?.toString() === c.id,
    description,
    emoji
  }
}


/**
 * Finds the right description to use for a channel
 */
function getDescriptionForChannel(i: GenericInteraction, permissions: CustomChannelPermissions, sussy: boolean): string {
  if (!permissions.viewChannel)
    return '⚠️ ' + Localisation.text(i, '=settings_channel_list_warning_missing_view_channel')

  if (!permissions.manageWebhooks)
    return '⚠️ ' + Localisation.text(i, '=settings_channel_list_warning_missing_manage_webhooks')

  if (!permissions.sendMessages)
    return '=settings_channel_list_warning_missing_send_messages'

  if (!permissions.embedLinks)
    return '=settings_channel_list_warning_missing_embed_messages'

  if (sussy)
    return 'sussy'

  return ''
}


/**
 * Finds the right emoji to use for a channel
 */
function getEmojiForChannel(recommended: boolean, type: number, sussy: boolean): ({ name: string } | { id: string }) {
  if (sussy) return Emojis.amogus.toObject()

  if (type === ChannelType.GUILD_NEWS) {
    return recommended
      ? Emojis.announcementChannelGreen.toObject()
      : Emojis.announcementChannel.toObject()
  }

  if (type === ChannelType.GUILD_NEWS_THREAD || type === ChannelType.GUILD_PUBLIC_THREAD) {
    return recommended
      ? Emojis.channelThreadsGreen.toObject()
      : Emojis.channelThreads.toObject()
  }

  return recommended
    ? Emojis.channelGreen.toObject()
    : Emojis.channel.toObject()
}


/**
 * Trims the name to maxlength and removes invalid characters
 */
function sanitizeChannelName(name: string, maxlength: number): string {
  if (!name) return 'channel without a name (sus)'
  if (name.length < maxlength) return name

  name = name.substring(0, maxlength)
  if (name.split('').some(n => n.charCodeAt(0) > 0xFF))
    // eslint-disable-next-line no-control-regex
    name = name.replace(/((?:[\0-\x08\x0B\f\x0E-\x1F\uFFFD\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]))/g, '')

  return name
}
