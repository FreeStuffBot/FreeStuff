import { InteractionUser } from "cordo"


export default class DiscordUtils {

  public static getAvatar(user: Partial<InteractionUser>) {
    return user?.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
      : `https://cdn.discordapp.com/embed/avatars/${parseInt(user?.discriminator || '0') % 5}.png`
  }

}
