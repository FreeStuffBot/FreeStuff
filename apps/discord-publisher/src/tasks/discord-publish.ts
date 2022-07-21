import { Task, TaskId } from "@freestuffbot/rabbit-hole"
import { ApiInterface, Experiments, FSApiGateway, GuildDataType, GuildSanitizer, Logger, ProductFilter, SanitizedProductType, Themes } from "@freestuffbot/common"
import Mongo from "../database/mongo"
import Upstream from "../lib/upstream"


export default async function handleDiscordPublish(task: Task<TaskId.DISCORD_PUBLISH>): Promise<boolean> {
  const bucketCount = task.c
  const bucketNumber = task.b
  const announcementId = task.a

  ApiInterface.reportPublishingProgress('discord', announcementId, 'begin', bucketNumber)

  const products = await FSApiGateway.getProductsForAnnouncement(announcementId)
  if (!products) return false

  const isDebug = (products.length === 1 && products[0].type === 'debug')
  if (isDebug) Logger.debug(`Task ${bucketNumber}/${bucketCount}`)

  const query = isDebug ? {
    sharder: { $mod: [ bucketCount, bucketNumber ] },
    /* webhook: { $ne: null } */
  } : {
    sharder: { $mod: [ bucketCount, bucketNumber ] },
    webhook: { $ne: null }
  }

  const guilds = await Mongo.Guild
    .find(query)
    .lean(true)
    .exec()
    .catch(() => {}) as GuildDataType[]
  if (!guilds?.length) return true

  for (const guild of guilds) {
    if (isDebug) await debugGuild(guild)
    else await sendToGuild(guild, products)
  }

  ApiInterface.reportPublishingProgress('discord', announcementId, 'complete', bucketNumber)
  return true
}

async function sendToGuild(guild: GuildDataType, products: SanitizedProductType[]): Promise<void> {
  const sanitizedGuild = GuildSanitizer.sanitize(guild)

  const filteredProducts = ProductFilter.filterList(products, sanitizedGuild)
  if (!filteredProducts.length) return

  const donationNotice = Experiments.runExperimentOnServer('show_donation_notice', sanitizedGuild)

  const theme = Themes.build(
    filteredProducts,
    sanitizedGuild,
    { test: false, donationNotice }
  )

  await Upstream.queueRequest({
    method: 'POST',
    url: `https://discord.com/api/webhooks/${sanitizedGuild.webhook}`,
    data: theme
  })
}

async function debugGuild(guild: GuildDataType): Promise<void> {
  await new Promise(res => setTimeout(res, 100))
  // Logger.debug('Gaming')
  // if (guild.webhook) return
  // if (!guild.channel) return

  // const { data, status } = await axios.get(`http://discord_gateway/webhooks/${guild.channel.toString()}?softcache`, {
  //   validateStatus: null
  // })

  // if (status !== 200) {
  //   Logger.debug(`Locate and register: status from gateway is ${status}`)
  //   return
  // }

  // const hooks: DataWebhook[] = data
  // if (!hooks.length) {
  //   Logger.debug(`Locate and register: no hooks`)
  //   return
  // }

  // const webhook = `${hooks[0].id}/${hooks[0].token}`
  // const g = await Mongo.Guild.findById(guild._id) as GuildType
  // if (!g) {
  //   Logger.debug(`Locate and register: guild not found. YIKES.`)
  //   return
  // }
  // g.webhook = webhook
  // await g.save()

  // Logger.debug(`Locate and register: registered for ${guild._id.toString()} (${hooks.length})  --  {x ${++upgraded}}`)
}
