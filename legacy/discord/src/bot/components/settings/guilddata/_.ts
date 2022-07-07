import { Const, Localisation } from '@freestuffbot/common'
import { ButtonStyle, ComponentType, InteractionComponentFlag, ReplyableComponentInteraction } from 'cordo'
import guildDataToViewString from '../../../../lib/guilddata-visualizer'
import Tracker from '../../../tracker'


export default function (i: ReplyableComponentInteraction) {
  Tracker.set(i.guildData, 'ACTION_DATA_REQUESTED')

  const errormsg = Localisation.text(i.guildData, '=settings_guilddata_display_error', { invite: Const.links.supportInvite })
  const guilddata = guildDataToViewString(i.guildData, 2000, errormsg)
  const raw = {
    _id: i.guildData._id,
    sharder: i.guildData.sharder,
    channel: i.guildData.channel,
    role: i.guildData.role,
    filter: i.guildData.filter,
    settings: i.guildData.settings,
    tracker: i.guildData.tracker
  }

  i.replyPrivately({
    title: '=settings_guilddata_success_1',
    description: `**What we store:**\n\`\`\`${JSON.stringify(raw)}\`\`\`\n**Human readable**:\n${guilddata}\n**About you specifically:**\nNothing :sparkles:`,
    components: [
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        label: '=settings_guilddata_delete_button',
        custom_id: 'settings_guilddata_delete',
        flags: [
          // because this is a reply to a bot message the interaction owner is now the bot itself no longer the user. Since this is ephemeral anyway it doesn't matter tho
          InteractionComponentFlag.ACCESS_EVERYONE
        ]
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.LINK,
        label: '=privacy_policy',
        url: Const.links.privacy
      }
    ]
  })
}
