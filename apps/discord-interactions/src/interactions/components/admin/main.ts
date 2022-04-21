import { ReplyableComponentInteraction } from 'cordo'


export default function (i: ReplyableComponentInteraction) {
  // if (!i.member || !RemoteConfig.botAdmins.includes(i.user.id))
  //   return i.ack()
  // TODO remote config

  i.state('admin_main')
}
