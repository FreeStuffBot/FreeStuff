import { CMS } from '@freestuffbot/common'
import { ReplyableCommandInteraction } from 'cordo'
import PermissionStrings from 'cordo/dist/lib/permission-strings'


export default async function (i: ReplyableCommandInteraction) {
  if (!i.member) {
    return i.reply({
      title: '=interaction_server_only_1',
      description: '=interaction_server_only_2'
    })
  }

  const botAdmin = !!CMS.remoteConfig[1]?.global.botAdmins.includes(i.user.id)
  if (!PermissionStrings.containsManageServer(i.member.permissions) && !botAdmin) {
    return i.replyPrivately({
      title: '=interaction_not_permitted_1',
      description: '=interaction_not_permitted_2_manage_server'
    })
  }

  // TODO
  // const [ , guild ] = await i.guildData.fetch()
  // if (guild?.beta)
  if (i.user.id === '137258778092503042')
    i.state('subscriptions_main')
  else
    i.state('settings_main')
}
