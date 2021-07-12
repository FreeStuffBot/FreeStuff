import { Core } from '../../../index'
import { ReplyableComponentInteraction } from '../../../cordo/types/ibase'
import PermissionStrings from '../../../lib/permission-strings'


export default async function (i: ReplyableComponentInteraction) {
  if (i.member && !PermissionStrings.containsManageServer(i.member.permissions))
    return i.ack()

  const guild = await Core.guilds.fetch(i.guild_id)
  await Core.databaseManager.changeSetting(guild, i.guildData, 'beta', !i.guildData.beta)
  i.state('settings_more')
}
