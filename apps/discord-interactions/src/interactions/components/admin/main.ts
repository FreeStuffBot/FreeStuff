import { ReplyableComponentInteraction } from 'cordo'
import RemoteConfig from '../../../lib/remote-config'
import Errors from '../../../lib/errors'


export default function (i: ReplyableComponentInteraction) {
  if (!i.member || !RemoteConfig.botAdmins.includes(i.user.id))
    return i.ack()

  if (!i.guildData) return Errors.handleError(Errors.createStderrNoGuilddata())

  i.state('admin_main')
}
