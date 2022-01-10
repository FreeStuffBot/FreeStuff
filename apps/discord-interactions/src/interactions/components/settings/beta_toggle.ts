import { ReplyableComponentInteraction } from 'cordo'
import PermissionStrings from 'cordo/dist/lib/permission-strings'
import Tracker from '../../../lib/tracker'


export default function (i: ReplyableComponentInteraction) {
  if (i.member && !PermissionStrings.containsManageServer(i.member.permissions))
    return i.ack()

  Tracker.set(i.guildData, 'ACTION_BETA_ENABLED_PREVIOUSLY')

  i.guildData.changeSetting('beta', !i.guildData.beta)
  i.state('settings_more')
}
