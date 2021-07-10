import { Core } from '../../../index'
import Const from '../../const'
import { ReplyableComponentInteraction } from '../../../cordo/types/ibase'
import guildDataToViewString from '../../../lib/guilddata-visualizer'


export default function (i: ReplyableComponentInteraction) {
  const errormsg = Core.text(i.guildData, '=cmd_mydata_display_error', { invite: Const.links.supportInvite })
  const guilddata = guildDataToViewString(i.guildData, 2000, errormsg)
  const raw = {
    _id: i.guildData._id,
    sharder: i.guildData.sharder,
    channel: i.guildData.channel,
    role: i.guildData.role,
    price: i.guildData.price,
    settings: i.guildData.settings
  }

  // TODO only show guild data if the user has manage guild permissions
  // Show a warning otherwise
  // Always show user data (aka nothing)

  i.replyPrivately({
    title: '=cmd_mydata_success_1',
    description: `**What we store:**\n\`\`\`${JSON.stringify(raw)}\`\`\`\n**Human readable**:\n${guilddata}\n**About you specifically:**\nNothing :sparkles:`
  })
}
