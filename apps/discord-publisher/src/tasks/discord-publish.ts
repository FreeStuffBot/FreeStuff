import { Task, TaskId } from "@freestuffbot/rabbit-hole"
import RabbitHole from '@freestuffbot/rabbit-hole'
import { config } from ".."
import { GuildDataType, GuildSanitizer, Localisation, SanitizedProductType, Themes } from "@freestuffbot/common"
import Mongo from "../database/mongo"
import Upstream from "../lib/upstream"
import ApiGateway from "../lib/api-gateway"


/* TODO */
export default async function handleDiscordPublish(task: Task<TaskId.DISCORD_PUBLISH>): Promise<boolean> {
  const bucketCount = task.c
  const bucketNumber = task.b
  const announcementId = task.a

  const query = {
    sharder: { $mod: [ bucketCount, bucketNumber ] },
    webhook: { $ne: null }
  }

  const guilds = await Mongo.Guild
    .find(query)
    .lean(true)
    .exec()
    .catch(() => {}) as GuildDataType[]

  if (!guilds?.length) return true

  console.log(guilds.length)

  const products = await ApiGateway.getProductsForAnnouncement(announcementId)
  if (!products) return false

  for (const guild of guilds)
    sendToGuild(guild, products)

  return true
}

function sendToGuild(guild: GuildDataType, products: SanitizedProductType[]) {
  const sanitizedGuild = GuildSanitizer.sanitize(guild)

  const theme = Themes.build(
    products,
    sanitizedGuild,
    { test: false, donationNotice: false /** TODO */ }
  )

  const localized = Localisation.translateObject(theme, sanitizedGuild, {}, 6)

  Upstream.queueRequest({
    method: 'POST',
    url: `https://discord.com/api/webhooks/${sanitizedGuild.webhook}`,
    data: localized
  })
  console.log('YO LETS WALK, ' + sanitizedGuild.id.toString())

  return true
}
