import { ReplyableComponentInteraction } from 'cordo'
import DatabaseManager from '../../database-manager'
import PermissionStrings from '../../../lib/permission-strings'


export default async function (i: ReplyableComponentInteraction) {
  if (i.member && !PermissionStrings.containsManageServer(i.member.permissions))
    return i.ack()

  await DatabaseManager.changeSetting(i.guildData, 'trash', !i.guildData.trashGames)
  i.state('settings_filter')
}
