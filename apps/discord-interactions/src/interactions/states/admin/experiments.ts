import { ButtonStyle, ComponentType, GenericInteraction, InteractionApplicationCommandCallbackData } from 'cordo'
import { Emojis } from '@freestuffbot/common'
import Experiments from '../../../lib/experiments'


export default function (i: GenericInteraction): InteractionApplicationCommandCallbackData {
  const description = Object
    .values(Experiments.getRawData())
    .map((ex: any) => `**${ex._id}**\n${Experiments.runExperimentOnServer(ex._id, i.guildData) ? '🗹' : '☐'} ${~~(ex.amount * 1000) / 10}% ${ex.group ? `of ${ex.group}` : ''}`)
    .join('\n\n')

  return {
    title: 'Experiments',
    description,
    components: [
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.SECONDARY,
        custom_id: 'admin_main',
        label: '=generic_back',
        emoji: Emojis.caretLeft.toObject()
      }
    ]
  }
}
