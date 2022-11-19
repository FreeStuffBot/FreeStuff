
export default class DiscordUtils {

  public static getAvatar(user: { id: string, avatar?: string, discriminator?: string | number }) {
    return user?.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
      : `https://cdn.discordapp.com/embed/avatars/${Number(user?.discriminator || '0') % 5}.png`
  }

}
