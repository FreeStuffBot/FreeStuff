import { Const } from '@freestuffbot/common'
import { ReplyableCommandInteraction } from 'cordo'


export default function (i: ReplyableCommandInteraction) {
  i.reply({
    title: '=cmd_vote_1',
    description: '=cmd_vote_2',
    _context: {
      topGGLink: Const.links.topgg,
      dblLink: Const.links.dbl,
      dlabsLink: Const.links.dlabs
    }
  })
}
