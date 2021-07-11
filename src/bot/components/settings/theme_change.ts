import { Core } from '../../../index'
import { ReplyableComponentInteraction } from '../../../cordo/types/ibase'
import Const from '../../const'


export default async function (i: ReplyableComponentInteraction) {
  const val = i.data.values[0]
  if (!val) return i.ack()

  const theme = Const.themes[parseInt(val) || 0]

  const guild = await Core.guilds.fetch(i.guild_id)
  await Core.databaseManager.changeSetting(guild, i.guildData, 'theme', theme)
  i.state('settings_display')
}
