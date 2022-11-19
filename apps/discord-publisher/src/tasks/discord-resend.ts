import { Task, TaskId } from "@freestuffbot/rabbit-hole"
import { FSApiGateway, GuildDataType, GuildSanitizer, Themes } from "@freestuffbot/common"
import Mongo from "../database/mongo"
import Upstream from "../lib/upstream"


export default async function handleDiscordResend(task: Task<TaskId.DISCORD_RESEND>): Promise<boolean> {
  const guild: GuildDataType = await Mongo.Guild
    .findById(task.g)
    .lean(true)
    .exec()
    .catch(() => {})

  if (!guild) return true

  const productIds = task.p
  const products = await FSApiGateway.getProductsByIds(productIds)
  if (!products) return false

  const sanitizedGuild = GuildSanitizer.sanitize(guild)
  // // we do not filter the products here as this is the job of whomever put the task in the queue
  // // this way we can use this event to force announce a certain product on a server with admin tools
  // const filteredProducts = ProductFilter.filterList(products, sanitizedGuild)

  const theme = Themes.build(
    products,
    sanitizedGuild,
    { test: false, donationNotice: false }
  )

  const [ path, thread ] = sanitizedGuild.webhook.split(':')
  const hook = thread ? `${path}?thread_id=${thread}` : path
  await Upstream.queueRequest({
    method: 'POST',
    url: `https://discord.com/api/webhooks/${hook}`,
    data: theme
  })

  return true
}
