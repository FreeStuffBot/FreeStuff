import { hostname } from 'os'
import { ButtonStyle, ComponentType, GenericInteraction, InteractionApplicationCommandCallbackData } from 'cordo'
import { Long } from 'mongodb'
import Database from '../../../database/database'
import Emojis from '../../emojis'
import Manager from '../../../controller/manager'
import { Core } from '../../..'


export default async function (i: GenericInteraction): Promise<InteractionApplicationCommandCallbackData> {
  try {
    const data = await Database
      .collection('guilds')
      .findOne({ _id: Long.fromString(i.guild_id) })

    data._ = {
      shard: (typeof i.guildData.sharder === 'number')
        ? (i.guildData.sharder % Core.options.shardCount)
        : (i.guildData.sharder.modulo(Long.fromInt(Core.options.shardCount)).toInt()),
      worker: Manager.getSelfUUID(),
      container: await hostname()
    }

    const description = '```json\n' + JSON.stringify(data, null, 2) + '```'

    return {
      title: 'Guild Data Print',
      description,
      components: [
        {
          type: ComponentType.BUTTON,
          style: ButtonStyle.SECONDARY,
          custom_id: 'admin_main',
          label: '=generic_back',
          emoji: { id: Emojis.caretLeft.id }
        }
      ]
    }
  } catch (ex) {
    return {
      title: 'Error',
      description: '```' + ex + '```'
    }
  }
}
