import { ReplyableCommandInteraction } from 'cordo'
import Const from '../const'


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
