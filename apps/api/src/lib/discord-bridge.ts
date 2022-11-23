import axios from "axios"
import { config } from ".."


const baseURL = 'https://discord.com/api/v10'
const guild = config.discordCommunity.guildId

const headers = { Authorization: `Bot ${config.discordCommunity.helperAuthToken}` }
const opts = { baseURL, headers, validateStatus: null }

export class DiscordBridge {

  /** true if successful */
  public static async assignRole(userid: string, ...addRoles: string[]): Promise<boolean> {
    const userRes = await axios
      .get(`/guilds/${guild}/members/${userid}`, opts)
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
      .patch(`/guilds/${guild}/members/${userid}`, data, opts)
      .catch(() => null)
    if (postRes?.status !== 200) console.error(postRes)
    return !!(postRes?.status === 200)
  }

}
