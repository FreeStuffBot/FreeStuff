import DiscordUtils from "../lib/discord-utils"
import { SanitizedUserType, UserDataType } from "../models/user.model"


export class UserSanitizer {

  public static sanitize(data: UserDataType): SanitizedUserType {
    if (!data) return null
    return {
      id: data._id,
      name: data.display,
      avatar: DiscordUtils.getAvatar(data.data),
      scope: data.scope,
      data: data.data
        ? {
            username: data.data.username,
            discriminator: data.data.discriminator,
            avatar: data.data.avatar,
            flags: data.data.flags,
            locale: data.data.locale,
            verified: data.data.verified
          }
        : {
            username: data.display,
            discriminator: '0000',
            avatar: '',
            flags: 0,
            locale: 'en-US',
            verified: false
          }
    }
  }

}
