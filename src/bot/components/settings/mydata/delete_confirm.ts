import { Long } from 'mongodb'
import { Core } from '../../../../index'
import { ReplyableComponentInteraction } from '../../../../cordo/types/ibase'
import PermissionStrings from '../../../../lib/permission-strings'
import { onGuildDataDeleteCooldown } from './delete'


export default async function (i: ReplyableComponentInteraction) {
  if (i.member && !PermissionStrings.containsManageServer(i.member.permissions))
    return i.ack()

  if (onGuildDataDeleteCooldown.includes(i.guild_id))
    return i.ack()

  onGuildDataDeleteCooldown.push(i.guild_id)
  setTimeout(() => onGuildDataDeleteCooldown.splice(0, 1), 1000 * 60 * 60 * 12)

  await Core.databaseManager.removeGuild(Long.fromString(i.guild_id))
  const guild = await Core.guilds.fetch(i.guild_id)
  await Core.databaseManager.addGuild(guild)

  i.edit({
    title: '=cmd_reset_success_1',
    description: '=cmd_reset_success_2',
    components: []
  })
}
