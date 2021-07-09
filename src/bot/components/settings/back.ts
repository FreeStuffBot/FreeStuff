import { InteractionEditFunction, InteractionReplyActionEvent } from '../../../types/interactions'

export default function handler(_: InteractionReplyActionEvent, edit: InteractionEditFunction) {
  edit({
    title: 'hi'
  })
}
