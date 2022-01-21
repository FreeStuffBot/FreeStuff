import { ReplyableComponentInteraction } from 'cordo'
import { Const } from '@freestuffbot/common'
import PermissionStrings from 'cordo/dist/lib/permission-strings'


export default function (i: ReplyableComponentInteraction) {
  if (i.member && !PermissionStrings.containsManageServer(i.member.permissions))
    return i.ack()

  const vals = i.data.values
  if (!vals) return i.ack()

  const platforms = Const
    .platforms
    .filter(p => vals.includes(p.id))

  i.guildData.changeSetting('platforms', platforms)
  i.state('settings_filter')
}
