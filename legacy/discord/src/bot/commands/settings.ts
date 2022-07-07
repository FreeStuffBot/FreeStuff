import { ReplyableCommandInteraction } from 'cordo'
import RemoteConfig from '../../controller/remote-config'
import PermissionStrings from '../../lib/permission-strings'


export default function (i: ReplyableCommandInteraction) {
  if (!i.member) {
    return i.reply({
      title: '=interaction_server_only_1',
      description: '=interaction_server_only_2'
    })
  }

  if (!PermissionStrings.containsManageServer(i.member.permissions) && !RemoteConfig.botAdmins.includes(i.user.id)) {
    return i.replyPrivately({
      title: '=interaction_not_permitted_1',
      description: '=interaction_not_permitted_2_manage_server'
    })
  }

  i.state('settings_main')
}
