import { ReplyableComponentInteraction } from 'cordo'


export default function (i: ReplyableComponentInteraction) {
  i.state('settings_channel', { ignoreCache: true })
}
