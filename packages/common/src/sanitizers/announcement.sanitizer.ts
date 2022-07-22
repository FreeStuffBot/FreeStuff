import { AnnouncementDataType, SanitizedAnnouncementType } from "../models/announcement.model"


export class AnnouncementSanitizer {

  public static sanitize(data: AnnouncementDataType): SanitizedAnnouncementType {
    if (!data) return null
    return {
      id: data._id,
      published: data.published,
      status: data.status,
      responsible: data.responsible,
      products: data.products,
      publishingMeta: data.publishingMeta
        ? JSON.parse(JSON.stringify(data.publishingMeta))
        : {}
    }
  }

}
