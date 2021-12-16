import { ReplyableComponentInteraction } from 'cordo'
import DatabaseManager from '../../database-manager'
import PermissionStrings from '../../../lib/permission-strings'
import Tracker from '../../tracker'


export default function (i: ReplyableComponentInteraction) {
  if (i.member && !PermissionStrings.containsManageServer(i.member.permissions))
    return i.ack()

  Tracker.set(i.guildData, 'ACTION_BETA_ENABLED_PREVIOUSLY')

  DatabaseManager.changeSetting(i.guildData, 'beta', !i.guildData.beta)
  i.state('settings_more')
}
