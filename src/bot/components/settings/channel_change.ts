import { ReplyableComponentInteraction } from 'cordo'
import { Core } from '../../../index'
import DatabaseManager from '../../database-manager'
import PermissionStrings from '../../../lib/permission-strings'


export default async function (i: ReplyableComponentInteraction) {
  if (i.member && !PermissionStrings.containsManageServer(i.member.permissions))
    return i.ack()

  const val = i.data.values[0]
  if (!val) return i.ack()

  if (val === '0') {
    await DatabaseManager.changeSetting(i.guildData, 'channel', null)
  } else {
    const channel = await Core.channels.fetch(val)
    if (!channel || (channel.type !== 'text' && channel.type !== 'news')) return i.ack()
    await DatabaseManager.changeSetting(i.guildData, 'channel', channel.id)
  }

  i.state('settings_channel')
}
