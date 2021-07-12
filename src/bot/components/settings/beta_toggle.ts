import { Core } from '../../../index'
import { ReplyableComponentInteraction } from '../../../cordo/types/ibase'


export default async function (i: ReplyableComponentInteraction) {
  const guild = await Core.guilds.fetch(i.guild_id)
  await Core.databaseManager.changeSetting(guild, i.guildData, 'beta', !i.guildData.beta)
  i.state('settings_more')
}
