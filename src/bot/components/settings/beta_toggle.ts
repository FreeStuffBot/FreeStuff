import { Core } from '../../../index'
import { ReplyableComponentInteraction } from '../../../cordo/types/ibase'
import PermissionStrings from '../../../lib/permission-strings'
import Tracker from '../../tracker'


export default async function (i: ReplyableComponentInteraction) {
  if (i.member && !PermissionStrings.containsManageServer(i.member.permissions))
    return i.ack()

  Tracker.set(i.guildData, 'ACTION_BETA_ENABLED_PREVIOUSLY')

  await Core.databaseManager.changeSetting(i.guildData, 'beta', !i.guildData.beta)
  i.state('settings_more')
}
