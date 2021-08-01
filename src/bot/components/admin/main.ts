import { ReplyableComponentInteraction } from 'cordo'
import RemoteConfig from '../../../controller/remote-config'


export default function (i: ReplyableComponentInteraction) {
  if (!i.member || !RemoteConfig.botAdmins.includes(i.user.id))
    return i.ack()

  if (!i.guildData) return { title: 'An error occured' }

  i.state('admin_main')
}
