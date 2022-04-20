import { Task, TaskId } from "@freestuffbot/rabbit-hole"
import Mongo from "../database/mongo"
import { Const, GuildDataType, GuildSanitizer, Localisation, Themes } from "@freestuffbot/common"
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

  const localized = Localisation.translateObject(theme, sanitizedGuild, {}, 6)

  Upstream.queueRequest({
    method: 'POST',
    url: `https://discord.com/api/webhooks/${sanitizedGuild.webhook}`,
    data: localized
  })

  return true
}
