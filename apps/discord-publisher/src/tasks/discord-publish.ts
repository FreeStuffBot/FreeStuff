import { Task, TaskId } from "@freestuffbot/rabbit-hole"
import { FSApiGateway, GuildDataType, GuildSanitizer, ProductFilter, SanitizedProductType, Themes } from "@freestuffbot/common"
import Mongo from "../database/mongo"
import Upstream from "../lib/upstream"


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

  const products = await FSApiGateway.getProductsForAnnouncement(announcementId)

  if (!products) return false

  for (const guild of guilds)
    sendToGuild(guild, products)

  return true
}

function sendToGuild(guild: GuildDataType, products: SanitizedProductType[]) {
  const sanitizedGuild = GuildSanitizer.sanitize(guild)

  const filteredProducts = ProductFilter.filterList(products, sanitizedGuild)
  if (!filteredProducts.length) return

  const theme = Themes.build(
    filteredProducts,
    sanitizedGuild,
    { test: false, donationNotice: false /** TODO */ }
  )

  Upstream.queueRequest({
    method: 'POST',
    url: `https://discord.com/api/webhooks/${sanitizedGuild.webhook}`,
    data: theme
  })

  return true
}
