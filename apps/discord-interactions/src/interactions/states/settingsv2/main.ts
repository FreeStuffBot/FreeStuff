import { Const, Errors } from '@freestuffbot/common'
import { ButtonStyle, ComponentType, GenericInteraction, InteractionApplicationCommandCallbackData, InteractionType } from 'cordo'
import Tracker from '../../../lib/tracker'


const recentlyInSetup: string[] = []

export default async function (i: GenericInteraction): Promise<InteractionApplicationCommandCallbackData> {
  const [ err, guildData ] = await i.guildData.fetch()
  if (err) return Errors.handleErrorAndCommunicate(err)

  const firstTimeOnPage = !Tracker.syncIsTracked(guildData, 'PAGE_DISCOVERED_SETTINGS_MAIN')
  Tracker.set(guildData, 'PAGE_DISCOVERED_SETTINGS_MAIN')

  const hintChannel = !guildData.channel
  const hintRole = !hintChannel && Tracker.syncShowHint(guildData, 'PAGE_DISCOVERED_SETTINGS_CHANGE_ROLE')
  const hintFilter = !hintChannel && !hintRole && Tracker.syncShowHint(guildData, 'PAGE_DISCOVERED_SETTINGS_CHANGE_FILTER')
  const hintDisplay = !hintChannel && !hintRole && !hintFilter && Tracker.syncShowHint(guildData, 'PAGE_DISCOVERED_SETTINGS_CHANGE_DISPLAY')

  if ((hintChannel || hintRole || hintFilter || hintDisplay) && !recentlyInSetup.includes(i.guild_id)) {
    recentlyInSetup.push(i.guild_id)
    setTimeout(() => recentlyInSetup.splice(0, 1), 1000 * 60 * 5)
  }

  const delayed = !firstTimeOnPage && i.type === InteractionType.COMMAND
  let description = '** **\nUse **Quick Setup** to quickly get started.\nOr click on **Manage Subscriptions** to get more detailed options.'
  // if (hintChannel) {
  //   description = delayed
  //     ? '=settings_main_ui_2_guided_channel_delayed'
  //     : '=settings_main_ui_2_guided_channel_normal'
  // }

  return {
    title: '<:freestuffbot:709372152402542613> Settings',
    description,
    components: [
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'quicksetup_main',
        label: 'Quick Setup'
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'subscriptions_main',
        label: 'Manage Subscriptions'
      },
      {
        type: ComponentType.LINE_BREAK
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'settings_main',
        label: '(debug) Old Settings'
      }
    ],
    _context: {
      invite: Const.links.supportInvite,
      guide: Const.links.guide
    }
  }
}
