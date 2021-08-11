import { ReplyableComponentInteraction } from 'cordo'
import DatabaseManager from '../../database-manager'
import Const from '../../const'
import PermissionStrings from '../../../lib/permission-strings'


export default async function (i: ReplyableComponentInteraction) {
  if (i.member && !PermissionStrings.containsManageServer(i.member.permissions))
    return i.ack()

  const vals = i.data.values
  if (!vals) return i.ack()

  const platforms = vals
    .map(v => Const.platforms.find(p => p.id === v))
    .filter(p => !!p)

  await DatabaseManager.changeSetting(i.guildData, 'platforms', platforms)
  i.state('settings_filter')
}