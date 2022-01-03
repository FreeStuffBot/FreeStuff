import { Long } from 'mongodb'
import { ReplyableComponentInteraction } from 'cordo'
import { Core } from '../../../../index'
import PermissionStrings from '../../../../lib/permission-strings'
import DatabaseManager from '../../../database-manager'
import { onGuildDataDeleteCooldown } from './delete'


export default async function (i: ReplyableComponentInteraction) {
  if (i.member && !PermissionStrings.containsManageServer(i.member.permissions))
    return i.ack()

  if (onGuildDataDeleteCooldown.includes(i.guild_id))
    return i.ack()

  onGuildDataDeleteCooldown.push(i.guild_id)
  setTimeout(() => onGuildDataDeleteCooldown.splice(0, 1), 1000 * 60 * 60 * 12)

  await DatabaseManager.removeGuild(Long.fromString(i.guild_id))
  const guild = await Core.guilds.fetch(i.guild_id)
  await DatabaseManager.addGuild(guild.id)

  i.edit({
    title: '=settings_guilddata_delete_success_1',
    description: '=settings_guilddata_delete_success_2',
    components: []
  })
}
