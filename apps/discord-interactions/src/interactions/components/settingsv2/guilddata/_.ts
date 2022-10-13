import { Const, Errors, Localisation } from '@freestuffbot/common'
import { ButtonStyle, ComponentType, InteractionComponentFlag, ReplyableComponentInteraction } from 'cordo'
import guildDataToViewString from '../../../../lib/guilddata-visualizer'
import Tracker from '../../../../lib/tracker'


export default async function (i: ReplyableComponentInteraction) {
  const [ err, guildDataRaw ] = await i.guildData.fetch()
  if (err) return Errors.handleErrorAndCommunicate(err, i)

  const guildData = { ...guildDataRaw }

  Tracker.set(guildData, 'ACTION_DATA_REQUESTED')

  if (guildData.webhook)
    guildData.webhook = `${guildData.webhook.split('/')[0]}/${guildData.webhook.split('/')[1].substring(0, 3)}...${guildData.webhook.substring(guildData.webhook.length - 3)}`

  const errormsg = Localisation.text(i, '=settings_guilddata_display_error', { invite: Const.links.supportInvite })
  const rendered = guildDataToViewString(guildData, 2000, errormsg)

  const raw = {
    id: guildData.id.toString(),
    sharder: guildData.sharder,
    channel: guildData.channel?.toString(),
    role: guildData.role?.toString(),
    filter: guildData.filter,
    settings: guildData.settings,
    tracker: guildData.tracker,
    webhook: guildData.webhook
  }

  i.replyPrivately({
    title: '=settings_guilddata_success_1',
    description: `**What we store:**\n\`\`\`${JSON.stringify(raw)}\`\`\`\n**Human readable**:\n${rendered}\n**Personalized Data:**\nNone :sparkles:`,
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
