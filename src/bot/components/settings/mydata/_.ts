import { Core } from '../../../../index'
import Const from '../../../const'
import { ReplyableComponentInteraction } from '../../../../cordo/types/ibase'
import guildDataToViewString from '../../../../lib/guilddata-visualizer'
import { ButtonStyle, ComponentType, InteractionComponentFlag } from '../../../../cordo/types/iconst'
import Tracker from '../../../tracker'


export default function (i: ReplyableComponentInteraction) {
  Tracker.set(i.guildData, 'ACTION_DATA_REQUESTED')

  const errormsg = Core.text(i.guildData, '=cmd_mydata_display_error', { invite: Const.links.supportInvite })
  const guilddata = guildDataToViewString(i.guildData, 2000, errormsg)
  const raw = {
    _id: i.guildData._id,
    sharder: i.guildData.sharder,
    channel: i.guildData.channel,
    role: i.guildData.role,
    price: i.guildData.price,
    settings: i.guildData.settings,
    tracker: i.guildData.tracker
  }

  // TODO only show guild data if the user has manage guild permissions
  // Show a warning otherwise
  // Always show user data (aka nothing)

  i.replyPrivately({
    title: '=cmd_mydata_success_1',
    description: `**What we store:**\n\`\`\`${JSON.stringify(raw)}\`\`\`\n**Human readable**:\n${guilddata}\n**About you specifically:**\nNothing :sparkles:`,
    components: [
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        label: 'Delete Guild Data',
        custom_id: 'settings_mydata_delete',
        flags: [
          // because this is a reply to a bot message the interaction owner is now the bot itself no longer the user. Since this is ephemeral anyway it doesn't matter tho
          InteractionComponentFlag.ACCESS_EVERYONE
        ]
      },
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.LINK,
        label: 'Privacy Policy',
        url: Const.links.privacy
      }
    ]
  })
}
