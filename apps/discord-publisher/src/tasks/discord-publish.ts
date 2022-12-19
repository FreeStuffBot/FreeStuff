import { Task, TaskId } from "@freestuffbot/rabbit-hole"
import { ApiInterface, Experiments, FSApiGateway, GuildDataType, GuildSanitizer, ProductFilter, SanitizedProductType, Themes } from "@freestuffbot/common"
import Mongo from "../database/mongo"
import Upstream from "../lib/upstream"
import { config } from ".."
import Metrics from "../lib/metrics"


export default async function handleDiscordPublish(task: Task<TaskId.DISCORD_PUBLISH>): Promise<boolean> {
  const bucketCount = task.c
  const bucketNumber = task.b
  const announcementId = task.a

  // report starting this task
  ApiInterface.reportPublishingProgress('discord', announcementId, 'begin', bucketNumber)

  // fetch products, if none found return unsuccessfully 
  const products = await FSApiGateway.getProductsForAnnouncement(announcementId)
  if (!products) {
    ApiInterface.reportPublishingProgress('discord', announcementId, 'abort-product-gateway', bucketNumber)
    Metrics.counterTasksConsumed.inc({ task: 'DISCORD_PUBLISH', status: 'no_products' })
    return false
  }

  // build query to fetch guidls in the bucket
  const query = {
    sharder: { $mod: [ bucketCount, bucketNumber ] },
    webhook: { $ne: null }
  }

  // fetch guilds with built query
  const guilds = await Mongo.Guild
    .find(query)
    .lean(true)
    .exec()
    .catch(() => (null)) as GuildDataType[]

  // error loading guilds
  if (!guilds) {
    ApiInterface.reportPublishingProgress('discord', announcementId, 'abort-database-gateway', bucketNumber)
    Metrics.counterTasksConsumed.inc({ task: 'DISCORD_PUBLISH', status: 'no_guilds' })
    return false
  }

  // no error but bucket empty
  if (!guilds.length) {
    ApiInterface.reportPublishingProgress('discord', announcementId, 'complete-empty', bucketNumber)
    Metrics.counterTasksConsumed.inc({ task: 'DISCORD_PUBLISH', status: 'guilds_empty' })
    return true
  }

  // wait until upstream is ready (might be blocked from a previous task)
  await Upstream.waitUntilWindowAvailable()

  // iterate all guilds
  while (guilds.length) {
    const batch = guilds.splice(0, config.behavior.publishTaskBatchSize)

    for (const guild of batch) 
      sendToGuild(guild, products)

    await Upstream.waitUntilWindowAvailable()
  }

  // complete
  ApiInterface.reportPublishingProgress('discord', announcementId, 'complete-normal', bucketNumber)
  Metrics.counterTasksConsumed.inc({ task: 'DISCORD_PUBLISH', status: 'success' })
  return true
}

function sendToGuild(guild: GuildDataType, products: SanitizedProductType[]) {
  const sanitizedGuild = GuildSanitizer.sanitize(guild)

  const filteredProducts = ProductFilter.filterList(products, sanitizedGuild)
  if (!filteredProducts.length) return

  const donationNotice = Experiments.runExperimentOnServer('show_donation_notice', sanitizedGuild)

  const theme = Themes.build(
    filteredProducts,
    sanitizedGuild,
    { test: false, donationNotice }
  )

  const [ path, thread ] = sanitizedGuild.webhook.split(':')
  const hook = thread ? `${path}?thread_id=${thread}` : path
  Upstream.queueRequest({
    method: 'POST',
    url: `https://discord.com/api/webhooks/${hook}`,
    data: theme,
    $type: 'task_publish',
    $attempt: 0,
    $guild: sanitizedGuild.id
  })
}
