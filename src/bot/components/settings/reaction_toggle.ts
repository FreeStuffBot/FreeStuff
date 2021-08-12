import { ReplyableComponentInteraction } from 'cordo'
import DatabaseManager from '../../database-manager'
import PermissionStrings from '../../../lib/permission-strings'


export default async function (i: ReplyableComponentInteraction) {
  if (i.member && !PermissionStrings.containsManageServer(i.member.permissions))
    return i.ack()

  await DatabaseManager.changeSetting(i.guildData, 'react', !i.guildData.react)
  i.state('settings_display')
}
