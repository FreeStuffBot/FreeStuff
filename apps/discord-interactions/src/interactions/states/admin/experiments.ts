import { ButtonStyle, ComponentType, GenericInteraction, InteractionApplicationCommandCallbackData } from 'cordo'
import { Emojis } from '@freestuffbot/common'
import Experiments from '../../../lib/experiments'
import Errors from '../../../lib/errors'


export default async function (i: GenericInteraction): Promise<InteractionApplicationCommandCallbackData> {
  const [ err, guildData ] = await i.guildData.fetch()
  if (err) return Errors.handleErrorAndCommunicate(err)

  const description = Object
    .values(Experiments.getRawData())
    .map((ex: any) => `**${ex._id}**\n${Experiments.runExperimentOnServer(ex._id, guildData) ? '🗹' : '☐'} ${~~(ex.amount * 1000) / 10}% ${ex.group ? `of ${ex.group}` : ''}`)
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
