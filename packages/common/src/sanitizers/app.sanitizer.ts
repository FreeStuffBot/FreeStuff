import { AppDataType, SanitizedAppType } from ".."


export class AppSanitizer {

  public static sanitize(data: AppDataType): SanitizedAppType {
    if (!data) return null
    return {
      id: data._id,
      type: data.type,
      description: data.description,
      key: data.key,
      webhookUrl: data.webhookUrl,
      webhookSecret: data.webhookSecret,
      lcKey: data.lcKey,
      lcWebhookUrl: data.lcWebhookUrl,
      lcWebhookVersion: data.lcWebhookVersion
    }
  }

}
