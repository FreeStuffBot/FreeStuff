import { Task, TaskId } from "@freestuffbot/rabbit-hole"
import Mongo from "../database/mongo"
import { Const, GuildDataType, GuildSanitizer, Localisation, ProductFilter, Themes } from "@freestuffbot/common"
import Upstream from "../lib/upstream"
import ApiGateway from "../lib/api-gateway"


export default async function handleDiscordResend(task: Task<TaskId.DISCORD_RESEND>): Promise<boolean> {
  const guild: GuildDataType = await Mongo.Guild
    .findById(task.g)
    .lean(true)
    .exec()
    .catch(() => {})

  if (!guild) return true

  // task.p
  const products = await ApiGateway.getProductsForAnnouncement(0) // TODO
  if (!products) return false

  const sanitizedGuild = GuildSanitizer.sanitize(guild)
  const filteredProducts = ProductFilter.filterList(products, sanitizedGuild)

  const theme = Themes.build(
    filteredProducts,
    sanitizedGuild,
    { test: true, donationNotice: false }
  )

  const localized = Localisation.translateObject(theme, sanitizedGuild, {}, 6)

  Upstream.queueRequest({
    method: 'POST',
    url: `https://discord.com/api/webhooks/${sanitizedGuild.webhook}`,
    data: localized
  })

  return true
}
