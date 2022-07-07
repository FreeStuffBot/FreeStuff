import { ChannelDataType, SanitizedChannelType } from ".."


export class ChannelSanitizer {

  public static sanitize(data: ChannelDataType): SanitizedChannelType {
    if (!data) return null
    return {
      id: data._id,
      name: data.name,
      description: data.description,
      premium: data.premium,
      default: data.default
    }
  }

}
