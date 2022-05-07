import { hostname } from 'os'
import { ButtonStyle, ComponentType, GenericInteraction, InteractionApplicationCommandCallbackData } from 'cordo'
import { Long } from 'mongodb'
import { Emojis } from '@freestuffbot/common'
// import Database from '../../../database/database'
// import Manager from '../../../controller/manager'
// import { Core } from '../../..'


// TODO(low) everything here
export default async function (i: GenericInteraction): Promise<InteractionApplicationCommandCallbackData> {
  // try {
  //   const data = await Database
  //     .collection('guilds')
  //     .findOne({ _id: Long.fromString(i.guild_id) })

  //   data._ = {
  //     shard: ((typeof i.guildData.sharder === 'number') ? i.guildData.sharder : i.guildData.sharder.getLowBits()) % Core.options.shardCount,
  //     worker: Manager.getSelfUUID(),
  //     container: await hostname()
  //   }

  //   const description = '```json\n' + JSON.stringify(data, null, 2) + '```'

  //   return {
  //     title: 'Guild Data Print',
  //     description,
  //     components: [
  //       {
  //         type: ComponentType.BUTTON,
  //         style: ButtonStyle.SECONDARY,
  //         custom_id: 'admin_main',
  //         label: '=generic_back',
  //         emoji: { id: Emojis.caretLeft.id }
  //       }
  //     ]
  //   }
  // } catch (ex) {
    return {
      title: 'Error',
      // description: '```' + ex + '```'
    }
  // }
}
