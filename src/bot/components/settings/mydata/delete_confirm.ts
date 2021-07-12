import { Long } from 'mongodb'
import { Core } from '../../../../index'
import { ReplyableComponentInteraction } from '../../../../cordo/types/ibase'
import PermissionStrings from '../../../../lib/permission-strings'


export default async function (i: ReplyableComponentInteraction) {
  if (i.member && !PermissionStrings.containsManageServer(i.member.permissions))
    return i.ack()

  await Core.databaseManager.removeGuild(Long.fromString(i.guild_id))
  const guild = await Core.guilds.fetch(i.guild_id)
  await Core.databaseManager.addGuild(guild)

  i.edit({
    title: '=cmd_reset_success_1',
    description: '=cmd_reset_success_2',
    components: []
  })
}
