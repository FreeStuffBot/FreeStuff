import { Const, Localisation } from '@freestuffbot/common'
import { ButtonStyle, ComponentType, GenericInteraction, InteractionApplicationCommandCallbackData, InteractionComponentFlag, InteractionType } from 'cordo'
import { TextChannel } from 'discord.js'
import { Core } from '../../..'
import Experiments from '../../../controller/experiments'
import FreeStuffBot from '../../../freestuffbot'
import Emojis from '../../emojis'
import Tracker from '../../tracker'


const recentlyInSetup: string[] = []

export default function (i: GenericInteraction): InteractionApplicationCommandCallbackData {
  if (!i.guildData) return { title: 'An error occured' }
  const firstTimeOnPage = !Tracker.isTracked(i.guildData, 'PAGE_DISCOVERED_SETTINGS_MAIN')
  Tracker.set(i.guildData, 'PAGE_DISCOVERED_SETTINGS_MAIN')

  const hintChannel = !i.guildData.channel
  const hintRole = !hintChannel && Tracker.showHint(i.guildData, 'PAGE_DISCOVERED_SETTINGS_CHANGE_ROLE')
  const hintFilter = !hintChannel && !hintRole && Tracker.showHint(i.guildData, 'PAGE_DISCOVERED_SETTINGS_CHANGE_FILTER')
  const hintDisplay = !hintChannel && !hintRole && !hintFilter && Tracker.showHint(i.guildData, 'PAGE_DISCOVERED_SETTINGS_CHANGE_DISPLAY')

  if ((hintChannel || hintRole || hintFilter || hintDisplay) && !recentlyInSetup.includes(i.guild_id)) {
    recentlyInSetup.push(i.guild_id)
    setTimeout(() => recentlyInSetup.splice(0, 1), 1000 * 60 * 5)
  }

  const webhookMigrationNotice = showWebhookMigrationNotice(i)
  let image: string | undefined
  if (webhookMigrationNotice) {
    image = FreeStuffBot.webhookMigrationImages[i.guildData.language]
      || FreeStuffBot.webhookMigrationImages.default
  }

  const delayed = !firstTimeOnPage && i.type === InteractionType.COMMAND
  let description = recentlyInSetup.includes(i.guild_id)
    ? '=settings_main_ui_2_guided_finished'
    : '=settings_main_ui_2_regular'
  if (hintChannel) {
    description = delayed
      ? '=settings_main_ui_2_guided_channel_delayed'
      : '=settings_main_ui_2_guided_channel_normal'
  } else if (hintRole) {
    description = delayed
      ? '=settings_main_ui_2_guided_role_delayed'
      : '=settings_main_ui_2_guided_role_normal'
  } else if (hintFilter) {
    description = delayed
      ? '=settings_main_ui_2_guided_filter_delayed'
      : '=settings_main_ui_2_guided_filter_normal'
  } else if (hintDisplay) {
    description = delayed
      ? '=settings_main_ui_2_guided_display_delayed'
      : '=settings_main_ui_2_guided_display_normal'
  }

  return {
    title: '=settings_main_ui_1',
    description,
    image,
    components: [
      {
        type: ComponentType.BUTTON,
        style: hintChannel ? ButtonStyle.PRIMARY : ButtonStyle.SECONDARY,
        custom_id: 'settings_channel',
        label: i.guildData?.channel ? '=settings_main_btn_channel_change' : '=settings_main_btn_channel_set',
        emoji: { id: Emojis.channel.id }
      },
      {
        type: ComponentType.BUTTON,
        style: hintRole ? ButtonStyle.PRIMARY : ButtonStyle.SECONDARY,
        custom_id: 'settings_role',
        label: i.guildData?.role ? '=settings_main_btn_role_change' : '=settings_main_btn_role_set',
        emoji: { id: Emojis.mention.id }
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'settings_language',
        label: '=lang_name',
        emoji: { name: Emojis.fromFlagName(Localisation.text(i.guildData, '=lang_flag_emoji')).string }
      },
      {
        type: ComponentType.LINE_BREAK
      },
      {
        type: ComponentType.BUTTON,
        style: hintDisplay ? ButtonStyle.PRIMARY : ButtonStyle.SECONDARY,
        custom_id: 'settings_display',
        label: '=settings_main_btn_display'
      },
      {
        type: ComponentType.BUTTON,
        style: hintFilter ? ButtonStyle.PRIMARY : ButtonStyle.SECONDARY,
        custom_id: 'settings_filter',
        label: '=settings_main_btn_filter'
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'settings_more',
        label: '=settings_main_btn_more'
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'admin_main',
        emoji: { name: '✨' },
        flags: [
          InteractionComponentFlag.ACCESS_BOT_ADMIN,
          InteractionComponentFlag.HIDE_IF_NOT_ALLOWED
        ]
      }
    ],
    _context: {
      invite: Const.links.supportInvite,
      guide: Const.links.guide
    }
  }
}

function showWebhookMigrationNotice(i: GenericInteraction): boolean {
  if (!Experiments.runExperimentOnServer('webhook_migration', i.guildData))
    return false

  if (!i.channel_id)
    return false

  const channel = Core.channels.resolve(i.channel_id) as TextChannel
  if (!channel) return false

  const guild = Core.guilds.resolve(i.guild_id)
  if (!guild) return false

  const member = guild.members.resolve(Core.user.id)
  if (!member) return false

  return !channel.permissionsFor(member)?.has('MANAGE_WEBHOOKS')
}
