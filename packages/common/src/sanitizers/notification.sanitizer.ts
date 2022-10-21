import { NotificationDataType, SanitizedNotificationType } from ".."


export class NotificationSanitizer {

  public static sanitize(data: NotificationDataType): SanitizedNotificationType {
    if (!data) return null
    return {
      id: data._id,
      type: data.type,
      data: data.data,
      recipient: data.recipient,
      sentAt: data.sentAt,
      readAt: data.readAt,
      sentBy: data.sentBy
    }
  }

}
