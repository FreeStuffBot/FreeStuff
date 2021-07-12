import { Core } from '../../../index'
import { ReplyableComponentInteraction } from '../../../cordo/types/ibase'
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

  const guild = await Core.guilds.fetch(i.guild_id)
  await Core.databaseManager.changeSetting(guild, i.guildData, 'platforms', platforms)
  i.state('settings_filter')
}
