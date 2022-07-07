import { GuildChannel, NewsChannel, TextChannel } from 'discord.js'
import { ButtonStyle, ComponentType, GenericInteraction, InteractionApplicationCommandCallbackData, InteractionComponentFlag, MessageComponentSelectOption } from 'cordo'
import { Localisation } from '@freestuffbot/common'
import { Core } from '../../../index'
import Emojis from '../../emojis'
import Tracker from '../../tracker'
import PermissionStrings from '../../../lib/permission-strings'


const recommendedChannelRegex = /free|game|gaming|deal/i
const filterOutChannelRegex1 = /rules|meme|support/i
const filterOutChannelRegex2 = /log|help|selfies/i
const filterOutChannelRegex3 = /team|partner|suggestions/i
const highProbChannelRegex = /announcement|new|general|computer|play|important|feed|bot|commands/i

function isRecommended(i: GenericInteraction, c: GuildChannel) {
  return recommendedChannelRegex.test(c.name) || i.channel_id === c.id || i.guildData.channel?.toString() === c.id
}

type Options = {
  missingPermissions?: string,
  changedTo?: string
}

export default async function (i: GenericInteraction, args: [ Options ]): Promise<InteractionApplicationCommandCallbackData> {
  if (!i.guildData) return { title: 'An error occured' }
  Tracker.set(i.guildData, 'PAGE_DISCOVERED_SETTINGS_CHANGE_CHANNEL')

  const guild = Core.guilds.resolve(i.guild_id)
  if (!guild) return { title: 'An error occured. Your guild could not be loaded. Please try again.' }

  let channelsFound = [ ...guild.channels.cache.values() ]
    .filter(c => (c.type === 'GUILD_TEXT' || c.type === 'GUILD_NEWS')) as (TextChannel | NewsChannel)[]

  const self = await guild.members.fetch(Core.user.id)

  let youHaveTooManyChannelsStage = 0

  // ah dang list is too long, let's start filtering some out
  if (channelsFound.length > 24) {
    channelsFound = channelsFound.filter(c => !c.nsfw || isRecommended(i, c))
    youHaveTooManyChannelsStage++
  }
  if (channelsFound.length > 24) {
    channelsFound = channelsFound.filter(c => self.permissionsIn(c).has('VIEW_CHANNEL') || isRecommended(i, c))
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

  const hereText = ` (${Localisation.text(i.guildData, '=settings_channel_list_here')})`

  const channels = channelsFound
    .sort((a, b) =>
      (isRecommended(i, a) ? -1000 : 0)
      - (isRecommended(i, b) ? -1000 : 0)
      + (a.position + (a.parent?.position || 0) * 100)
      - (b.position + (b.parent?.position || 0) * 100)
    )
    .slice(0, 24)
    .map((c) => {
      const p = c.permissionsFor(self)
      let description = '' // (c as TextChannel).topic?.slice(0, 50) || ''
      if (!p.has('VIEW_CHANNEL')) description = '⚠️ ' + Localisation.text(i.guildData, '=settings_channel_list_warning_missing_view_channel')
      else if (!p.has('MANAGE_WEBHOOKS')) description = '⚠️ ' + Localisation.text(i.guildData, '=settings_channel_list_warning_missing_manage_webhooks')
      else if (!p.has('SEND_MESSAGES')) description = '=settings_channel_list_warning_missing_send_messages'
      else if (!p.has('EMBED_LINKS')) description = '=settings_channel_list_warning_missing_embed_messages'
      else if (c.name.includes('amogus') || c.name.includes('sus')) description = 'sus channel'

      return {
        label: (c.id === i.channel_id) && (c.name.length + hereText.length <= 25)
          ? c.name.split('\\').join('') + hereText
          : sanitizeChannelName(c.name, 25),
        value: c.id,
        default: i.guildData.channel?.toString() === c.id,
        description,
        emoji: {
          id: (c.name.includes('amogus') || c.name.includes('sus'))
            ? Emojis.amogus.id
            : (c.type === 'GUILD_NEWS')
                ? isRecommended(i, c)
                  ? Emojis.announcementChannelGreen.id
                  : Emojis.announcementChannel.id
                : isRecommended(i, c)
                  ? Emojis.channelGreen.id
                  : Emojis.channel.id
        }
      }
    })

  const options: MessageComponentSelectOption[] = [
    {
      label: '=settings_channel_list_no_channel_1',
      value: '0',
      default: !i.guildData.channel,
      description: '=settings_channel_list_no_channel_2',
      emoji: { id: Emojis.no.id }
    },
    ...channels
  ]

  const opts = args[0]

  let description = Localisation.text(i.guildData, '=settings_channel_ui_2_regular')
  if (youHaveTooManyChannelsStage > 2)
    description = Localisation.text(i.guildData, '=settings_channel_ui_2_way_too_many') + '\n\n*' + Localisation.text(i.guildData, '=settings_channel_ui_too_many_channels_tip') + '*'
  else if (youHaveTooManyChannelsStage > 0)
    description = Localisation.text(i.guildData, '=settings_channel_ui_2_too_many') + '\n\n*' + Localisation.text(i.guildData, '=settings_channel_ui_too_many_channels_tip') + '*'
  if (opts?.missingPermissions)
    description += `\n\n⚠️ **${Localisation.text(i.guildData, '=settings_channel_ui_missing_permissions', { channel: opts?.changedTo, permissions: opts?.missingPermissions })}**`

  return {
    title: '=settings_channel_ui_1',
    description,
    components: [
      {
        type: ComponentType.SELECT,
        custom_id: 'settings_channel_change',
        options,
        flags: [ InteractionComponentFlag.ACCESS_MANAGE_SERVER ]
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'settings_main',
        label: '=generic_back',
        emoji: { id: Emojis.caretLeft.id }
      }
    ],
    footer: PermissionStrings.containsManageServer(i.member.permissions) ? '' : '=settings_permission_disclaimer'
  }
}

function sanitizeChannelName(name: string, maxlength: number): string {
  if (name.length < maxlength) return name

  name = name.slice(0, maxlength)
  if (name.split('').some(n => n.charCodeAt(0) > 0xFF))
    // eslint-disable-next-line no-control-regex
    name = name.replace(/((?:[\0-\x08\x0B\f\x0E-\x1F\uFFFD\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]))/g, '')

  return name
}
