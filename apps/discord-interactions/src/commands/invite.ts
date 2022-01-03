import { Const } from '@freestuffbot/common'
import { ReplyableCommandInteraction } from 'cordo'


export default function (i: ReplyableCommandInteraction) {
  i.reply({
    title: '=cmd_invite_1',
    description: '=cmd_invite_2',
    _context: { inviteLink: Const.links.botInvite }
  })
}
