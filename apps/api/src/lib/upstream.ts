import RabbitHole, { TaskId } from "@freestuffbot/rabbit-hole"
import { config } from ".."
import Mongo from "../database/mongo"


export default class Upstream {

  public static publish(announcementId: number) {
    Upstream.publishToDiscord(announcementId)
    Upstream.publishToApps(announcementId)
  }

  public static async publishToDiscord(announcementId: number) {
    let guilds = await Mongo.Guild.count()
    if (guilds < 200000) guilds = 200000 // Failswitch, if the guilds yields 0, -1 or any other incorrect low value this wont create a single huge bucket
    const announcementBucketCount = Math.round(guilds / config.behavior.desiredGuildCountPerBucket)

    RabbitHole.publish({
      t: TaskId.DISCORD_PUBLISH_SPLIT,
      a: announcementId,
      v: 0,
      c: announcementBucketCount
    })
  }

  public static async publishToApps(announcementId: number) {
    let apps = await Mongo.App.count()
    if (apps < 50) apps = 50
    const announcementBucketCount = Math.round(apps / config.behavior.desiredAppCountPerBucket)

    RabbitHole.publish({
      t: TaskId.APPS_PUBLISH_SPLIT,
      a: announcementId,
      v: 0,
      c: announcementBucketCount
    })
  }

}
