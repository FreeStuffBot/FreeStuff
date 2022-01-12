import { ReplyableComponentInteraction } from 'cordo'
import RemoteConfig from '../../../lib/remote-config'


export default function (i: ReplyableComponentInteraction) {
  if (!i.member || !RemoteConfig.botAdmins.includes(i.user.id))
    return i.ack()

  i.state('admin_main')
}
