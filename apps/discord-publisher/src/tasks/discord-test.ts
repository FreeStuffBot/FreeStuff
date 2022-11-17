import { Task, TaskId } from "@freestuffbot/rabbit-hole"
import { Const, GuildDataType, GuildSanitizer, Themes } from "@freestuffbot/common"
import Mongo from "../database/mongo"
import Upstream from "../lib/upstream"


export default async function handleDiscordTest(task: Task<TaskId.DISCORD_TEST>): Promise<boolean> {
  const guild: GuildDataType = await Mongo.Guild
    .findById(task.g)
    .lean(true)
    .exec()
    .catch(() => {})

  if (!guild) return true

  const sanitizedGuild = GuildSanitizer.sanitize(guild)

  const theme = Themes.build(
    [ Const.testAnnouncementContent ],
    sanitizedGuild,
    { test: true, donationNotice: false }
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
