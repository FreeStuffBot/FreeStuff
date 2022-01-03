import { ReplyableComponentInteraction } from 'cordo'
import DatabaseManager from '../../database-manager'
import PermissionStrings from '../../../lib/permission-strings'


export default function (i: ReplyableComponentInteraction) {
  if (i.member && !PermissionStrings.containsManageServer(i.member.permissions))
    return i.ack()

  DatabaseManager.changeSetting(i.guildData, 'react', !i.guildData.react)
  i.state('settings_display')
}
