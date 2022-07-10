import { Task, TaskId } from "@freestuffbot/rabbit-hole"
import { DataWebhook, FSApiGateway, GuildDataType, GuildSanitizer, Logger, ProductFilter, SanitizedGuildType, SanitizedProductType, Themes } from "@freestuffbot/common"
import axios from "axios"
import Mongo from "../database/mongo"
import Upstream from "../lib/upstream"


export default async function handleDiscordPublish(task: Task<TaskId.DISCORD_PUBLISH>): Promise<boolean> {
  const bucketCount = task.c
  const bucketNumber = task.b
  const announcementId = task.a

  const query = {
    sharder: { $mod: [ bucketCount, bucketNumber ] },
    // webhook: { $ne: null }
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
    await sendToGuild(guild, products)

  return true
}

async function sendToGuild(guild: GuildDataType, products: SanitizedProductType[]) {
  const sanitizedGuild = GuildSanitizer.sanitize(guild)

  // const filteredProducts = ProductFilter.filterList(products, sanitizedGuild)
  // if (!filteredProducts.length) return

  // const theme = Themes.build(
  //   filteredProducts,
  //   sanitizedGuild,
  //   { test: false, donationNotice: false /** TODO */ }
  // )

  if (sanitizedGuild.webhook)
    return true

  await locateAndRegisterWebhook(sanitizedGuild)

  // await Upstream.queueRequest({
  //   method: 'POST',
  //   url: `https://discord.com/api/webhooks/${sanitizedGuild.webhook}`,
  //   data: theme
  // })

  return true
}

async function locateAndRegisterWebhook(guild: SanitizedGuildType) {
  if (!guild.channel) return
  const { data, status } = await axios.get(`http://discord_gateway/webhooks/${guild.channel.toString()}?softcache`, {
    validateStatus: null
  })

  if (status !== 200) {
    Logger.debug(`Locate and register: status from gateway is ${status}`)
    return
  }

  const hooks: DataWebhook[] = data
  if (!hooks.length) {
    Logger.debug(`Locate and register: no hooks`)
    return
  }

  Mongo.Guild.updateOne({
    _id: guild.id,    
  }, {
    $set: {
      webhook: `${hooks[0].id}/${hooks[0].token}`
    }
  })
  Logger.debug(`Locate and register: registered for ${guild.id.toString()} (${hooks.length})`)
}
