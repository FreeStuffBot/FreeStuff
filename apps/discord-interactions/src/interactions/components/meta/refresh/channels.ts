import { ReplyableComponentInteraction } from 'cordo'
import { config } from '../../../..'


const blocked: Set<string> = new Set()

export default function (i: ReplyableComponentInteraction) {    
  if (blocked.has(i.guild_id)) {
    return i.replyPrivately({
      content: '=refresh_channels_timeout',
      _context: { interval: (~~(config.userLimits.refreshRolesInterval / 1000)).toString() }
    })
  }

  blocked.add(i.guild_id)
  i.state('settings_channel', { ignoreCache: true })

  setTimeout(id => blocked.delete(id), config.userLimits.refreshChannelsInterval, i.guild_id)
}
