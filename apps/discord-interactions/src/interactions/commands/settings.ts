import { ReplyableCommandInteraction } from 'cordo'
import PermissionStrings from 'cordo/dist/lib/permission-strings'
import RemoteConfig from '../../lib/remote-config'


/** This entire file could be ommitted but I decided to add this for transparency as it could easily be too confusing where the settings command gets handled */
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
