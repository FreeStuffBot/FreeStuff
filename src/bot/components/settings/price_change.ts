import { ReplyableComponentInteraction } from 'cordo'
import DatabaseManager from '../../database-manager'
import Const from '../../const'
import PermissionStrings from '../../../lib/permission-strings'


export default async function (i: ReplyableComponentInteraction) {
  if (i.member && !PermissionStrings.containsManageServer(i.member.permissions))
    return i.ack()

  const val = i.data.values[0]
  if (!val) return i.ack()

  const price = Const.priceClasses[parseInt(val, 10) || 0]

  await DatabaseManager.changeSetting(i.guildData, 'price', price)
  i.state('settings_filter')
}
