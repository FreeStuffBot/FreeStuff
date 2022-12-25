import { AnnouncementType } from "@freestuffbot/common"
import RabbitHole, { TaskId } from "@freestuffbot/rabbit-hole"
import Modules from "modules"
import { config } from ".."
import Mongo from "../database/mongo"


export default class Upstream {

  public static async publish(announcement: AnnouncementType) {
    await Promise.all([
      Upstream.publishToDiscord(announcement),
      Upstream.publishToApps(announcement),
      Upstream.publishToTelegram(announcement)
    ])

    await announcement.save()

    Modules.umiSender.send(
      '*',
      'refetch',
      { entries: [ 'api.announcement.*', 'api.channel.*' ] }
    )
  }

  public static async publishToDiscord(announcement: AnnouncementType) {
    let guilds = await Mongo.Guild.count()
    if (guilds < 200000) guilds = 200000 // Failswitch, if the guilds yields 0, -1 or any other incorrect low value this wont create a single huge bucket
    const announcementBucketCount = Math.round(guilds / config.behavior.desiredGuildCountPerBucket)

    announcement.publishingMeta.discord.bucketCount = announcementBucketCount

    await RabbitHole.publish({
      t: TaskId.DISCORD_PUBLISH_SPLIT,
      a: announcement._id,
      v: 0,
      c: announcementBucketCount
    })
  }

  public static async publishToApps(announcement: AnnouncementType) {
    let apps = await Mongo.App.count()
    if (apps < 50) apps = 50
    const announcementBucketCount = Math.round(apps / config.behavior.desiredAppCountPerBucket)

    // TODO (medium)
    // announcement.publishingMeta.apps.bucketCount = announcementBucketCount

    RabbitHole.publish({
      t: TaskId.APPS_PUBLISH_SPLIT,
      a: announcement._id,
      v: 0,
      c: announcementBucketCount
    })
  }

  // TODO (medium) put actual bucket count in
  // eslint-disable-next-line require-await
  public static async publishToTelegram(announcement: AnnouncementType) {
    const announcementBucketCount = 1

    // TODO (medium)
    // announcement.publishingMeta.telegram.bucketCount = announcementBucketCount

    RabbitHole.publish({
      t: TaskId.TELEGRAM_PUBLISH_SPLIT,
      a: announcement._id,
      v: 0,
      c: announcementBucketCount
    })
  }

}
