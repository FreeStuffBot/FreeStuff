import { PlatformDataType, SanitizedPlatformType } from ".."


export class PlatformSanitizer {

  public static sanitize(data: PlatformDataType): SanitizedPlatformType {
    if (!data) return null
    return {
      id: data._id,
      code: data.code,
      name: data.name,
      url: data.url,
      description: data.description,
      assets: {
        icon: data.assets.icon
      },
      gibuRef: data.gibuRef
    }
  }

}
