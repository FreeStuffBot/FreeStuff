import { PlatformDataType, SanitizedPlatformType } from ".."


export default class PlatformSanitizer {

  public static sanitize(data: PlatformDataType): SanitizedPlatformType {
    if (!data) return null
    return {
      id: data._id,
      name: data.name,
      url: data.url,
      description: data.description,
      assets: {
        icon: data.assets.icon
      }
    }
  }

}
