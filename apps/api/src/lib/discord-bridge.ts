import axios, { AxiosRequestConfig } from "axios"
import { config } from ".."

const baseURL = 'https://discord.com/api/v10'
const guild = config.discordCommunity.guildId

export class DiscordBridge {

  private static buildOpts(additionalHeaders?: any): AxiosRequestConfig<any> {
    return {
      baseURL,
      headers: {
        ...additionalHeaders,
        Authorization: `Bot ${config.discordCommunity.helperAuthToken}`
      },
      validateStatus: null
    }
  }

  /** true if successful */
  public static async assignRole(userid: string, ...addRoles: string[]): Promise<boolean> {
    const userRes = await axios
      .get(`/guilds/${guild}/members/${userid}`, this.buildOpts())
      .catch(() => null)
    if (userRes?.status !== 200) console.error(userRes)
    if (userRes?.status !== 200) return false

    const roles = userRes.data.roles as string[]

    for (const role of addRoles) {
      if (!roles.includes(role))
        roles.push(role)
    }

    const data = { roles }
    const postRes = await axios
      .patch(`/guilds/${guild}/members/${userid}`, data, this.buildOpts())
      .catch(() => null)
    if (postRes?.status !== 200) console.error(postRes)
    return !!(postRes?.status === 200)
  }

}
