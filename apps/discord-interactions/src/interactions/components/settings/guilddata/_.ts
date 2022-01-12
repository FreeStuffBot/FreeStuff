import { Const, Localisation } from '@freestuffbot/common'
import { ButtonStyle, ComponentType, InteractionComponentFlag, ReplyableComponentInteraction } from 'cordo'
import Errors from '../../../../lib/errors'
import guildDataToViewString from '../../../../lib/guilddata-visualizer'
import Tracker from '../../../../lib/tracker'


export default async function (i: ReplyableComponentInteraction) {
  const [ err, guildData ] = await i.guildData.fetch()
  if (err) return Errors.handleErrorAndCommunicate(err)

  Tracker.set(guildData, 'ACTION_DATA_REQUESTED')

  const errormsg = Localisation.text(guildData, '=settings_guilddata_display_error', { invite: Const.links.supportInvite })
  const guilddata = guildDataToViewString(guildData, 2000, errormsg)
  const raw = {
    _id: guildData._id,
    sharder: guildData.sharder,
    channel: guildData.channel,
    role: guildData.role,
    filter: guildData.filter,
    settings: guildData.settings,
    tracker: guildData.tracker
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
