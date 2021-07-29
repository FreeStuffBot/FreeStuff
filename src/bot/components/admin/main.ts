import { hostname } from 'os'
import { ButtonStyle, ComponentType, ReplyableComponentInteraction } from 'cordo'
import { Long } from 'mongodb'
import { Core } from '../../..'
import RemoteConfig from '../../../controller/remote-config'
import Database from '../../../database/database'
import Logger from '../../../lib/logger'
import AnnouncementManager from '../../announcement-manager'
import Emojis from '../../emojis'


export default function (i: ReplyableComponentInteraction) {
  if (!i.member || !RemoteConfig.botAdmins.includes(i.user.id))
    return i.ack()

  if (!i.guildData) return { title: 'An error occured' }

  i
    .editInteractive({
      title: 'Super Secret Admin Panel 🚀',
      description: 'poggers',
      components: [
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          custom_id: 'admin_refetch',
          label: '>Refetch'
        },
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          custom_id: 'admin_print',
          label: 'Print'
        },
        {
          type: ComponentType.LINE_BREAK
        },
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          custom_id: 'settings_main',
          label: '=generic_back',
          emoji: { id: Emojis.caretLeft.id }
        },
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          custom_id: 'admin_experiments',
          label: 'Show Experiments'
        }
      ]
    })
    .withTimeout(60e3, true, j => j.state('settings_main'))
    .on('admin_refetch', (h) => {
      AnnouncementManager.updateCurrentFreebies()
      h.ack()
    })
    .on('admin_print', (h) => {
      Database
        .collection('guilds')
        .findOne({ _id: Long.fromString(i.guild_id) })
        .then(async (data) => {
          data._ = {
            responsibleShard: Core.options.shards[0],
            runningOnServer: await hostname()
          }

          const content = '```json\n' + JSON.stringify(data, null, 2) + '```'
          h.replyPrivately({ content })
        })
        .catch(Logger.error)
      h.ack()
    })
    .on('admin_experiments', (h) => {
      h.ack()
    })
}
