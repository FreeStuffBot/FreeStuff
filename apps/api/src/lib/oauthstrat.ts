/**
 * THIS CODE IS PROPERTY OF THE LOQUI CODEBASE
 * COMERCIAL AND PRIVATE USE IS PROHIBITED WITHOUT WRITTEN PERMISSION BY THE LOQUI TEAM
 * copyright 2021 loqui.app
 * 
 * @author Loqui Core Team
 * @copyright 2021 loqui.app
 */

import { encode, stringify } from 'querystring'
import Axios from 'axios'
import { config } from '../index'


/* eslint-disable camelcase */
export interface OauthDiscordUserObject {
  id: string
  username: string
  avatar: string
  discriminator: string
  public_flags: number
  flags: number
  banner: string | null
  banner_color: string
  accent_color: number
  locale: string
  mfa_enabled: boolean
  email: string
  verified: boolean
  _accessToken: string
}

export default class OAuthStrat {

  public static DISCORD_SCOPE = 'identify guilds'
  public static DISCORD_REDIRECT = `${config.dashboardOauthCallbackUrl}/discord`
  public static DISCORD_URL = 'https://discord.com/oauth2/authorize?' + encode({
    response_type: 'code',
    client_id: config.oauth.discord.appId,
    redirect_uri: OAuthStrat.DISCORD_REDIRECT,
    scope: OAuthStrat.DISCORD_SCOPE
  })

  //

  public static async discordCallback(code: string): Promise<OauthDiscordUserObject | { error: string }> {
    const { data, status } = await Axios.post('https://discord.com/api/oauth2/token', stringify({
      client_id: config.oauth.discord.appId,
      client_secret: config.oauth.discord.appSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.DISCORD_REDIRECT
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      validateStatus: () => true
    })

    if (status !== 200)
      return { error: 'bad_code' }

    const { data: user, status: status2 }: { data: OauthDiscordUserObject, status: number } = await Axios.get('https://discordapp.com/api/v9/users/@me', {
      headers: {
        Authorization: `${data.token_type} ${data.access_token}`
      },
      validateStatus: () => true
    })

    if (status2 !== 200)
      return { error: 'bad_gateway' }

    user._accessToken = data.access_token

    return user
  }

}
