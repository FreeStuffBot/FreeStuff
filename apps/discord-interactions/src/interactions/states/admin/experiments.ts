import { ButtonStyle, ComponentType, GenericInteraction, InteractionApplicationCommandCallbackData } from 'cordo'
import { CMS, Emojis, Errors, Experiments } from '@freestuffbot/common'
import { ExperimentId } from '@freestuffbot/common/dist/lib/experiments'


export default async function (i: GenericInteraction): Promise<InteractionApplicationCommandCallbackData> {
  const [ err1, guildData ] = await i.guildData.fetch()
  if (err1) return Errors.handleErrorAndCommunicate(err1)

  const [ err2, experiments ] = CMS.experiments
  if (err2) return Errors.handleErrorAndCommunicate(err2)

  const description = experiments
    .map(ex => `**${ex.id}**\n${Experiments.runExperimentOnServer(ex.id as ExperimentId, guildData) ? '🗹' : '☐'} ${~~(ex.amount * 1000) / 10}% ${ex.group ? `of ${ex.group}` : ''}`)
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
