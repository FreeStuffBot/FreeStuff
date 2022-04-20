import { Task, TaskId } from "@freestuffbot/rabbit-hole"
import { GuildDataType, GuildSanitizer, Localisation, ProductFilter, SanitizedProductType, Themes } from "@freestuffbot/common"
import Mongo from "../database/mongo"
import Upstream from "../lib/upstream"
import ApiGateway from "../lib/api-gateway"


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

  const products = await ApiGateway.getProductsForAnnouncement(announcementId)
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

  const localized = Localisation.translateObject(theme, sanitizedGuild, {}, 6)

  Upstream.queueRequest({
    method: 'POST',
    url: `https://discord.com/api/webhooks/${sanitizedGuild.webhook}`,
    data: localized
  })

  return true
}
