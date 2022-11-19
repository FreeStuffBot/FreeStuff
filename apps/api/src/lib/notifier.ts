import { NotificationType, NotificationTypeEnum } from "@freestuffbot/common"
import axios from "axios"
import { MessageEmbed } from "cordo"
import { config } from ".."
import Mongo from "../database/mongo"
import AuditLog from "./audit-log"
import LocalConst from "./local-const"


export type NotificationRecipient = string
export type NotificationPayload = {
  title: string,
  message: string
}

export default class Notifier {

  public static async sendPlain(recipient: NotificationRecipient, data: NotificationPayload, sender: string = LocalConst.PSEUDO_USER_SYSTEM_ID) {
    const notif = new Mongo.Notification({
      type: NotificationTypeEnum.PLAIN,
      data,
      recipient,
      sentAt: Date.now(),
      readAt: null,
      sentBy: sender
    }) as NotificationType
    notif.save()

    if (config.notifications.destinationDiscord) {
      const [ name, icon ] = await AuditLog.getAuthor(sender)
      const embed: MessageEmbed = {
        author: {
          name,
          icon_url: icon
        },
        description: 'You have a new notification! [Click here](https://dashboard.freestuffbot.xyz/)',
        color: 0x2f3136
      }

      await axios.post(
        config.notifications.destinationDiscord,
        { content: `<@${recipient}>`, embeds: [ embed ] },
        { validateStatus: null }
      ).catch(() => ({} as any))
    }
  }

}
