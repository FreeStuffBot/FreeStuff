import { SanitizedProductType } from '@freestuffbot/common'
import axios from 'axios'
import { google } from 'googleapis'
import { config } from '..'
import StringUtils from '../lib/stringutils'


export type FirebaseDomain = 'redirect.freestuffbot.xyz/game' | 'freestuff.page.link'

export type DynlinkMeta = {
  socialTitle?: string
  socialDescription?: string
  socialImageLink?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
}


export default class FirebasePagelink {

  /**
   * Create a Firebase Dynamic Link
   * @param domain the base domain to host the link on
   * @param link the target url to point the link to
   * @param decorator an optional string to append to the link for clearer target that does not affect the link
   * @param meta optional meta data
   */
  public static async createLink(domain: FirebaseDomain, link: string, decorator?: string, meta?: DynlinkMeta): Promise<string> {
    if (!config.thirdparty?.firebase?.key) return ''

    const { data, status } = await axios.post(`https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${config.thirdparty.firebase.key}`, {
      dynamicLinkInfo: {
        domainUriPrefix: `https://${domain}`,
        link,
        analyticsInfo: {
          googlePlayAnalytics: {
            utmSource: meta?.utmSource,
            utmMedium: meta?.utmMedium,
            utmCampaign: meta?.utmCampaign,
            utmTerm: meta?.utmTerm,
            utmContent: meta?.utmContent
          }
        },
        socialMetaTagInfo: {
          socialTitle: meta?.socialTitle,
          socialDescription: meta?.socialDescription,
          socialImageLink: meta?.socialImageLink
        }
      },
      suffix: {
        option: 'SHORT'
      }
    }, {
      validateStatus: null
    })

    if (status !== 200) {
      console.error(data)
      return ''
    }

    return data.shortLink + (decorator ? `#${decorator}` : '')
  }

  public static createLinkForGame(game: SanitizedProductType): Promise<string> {
    return this.createLink('redirect.freestuffbot.xyz/game', game.urls.org, StringUtils.sanitizeGameName(game.title), {
      socialTitle: `Get ${game.title} for 100% off!`,
      socialDescription: game.description,
      socialImageLink: game.thumbnails.org
    })
  }

  //

  private static jwtClient: any // typeof google.auth.JWT

  public static analyticsInit() {
    const serviceAccount = require('../../../vault/firebase-serviceAccountKey.json') // TODO
    const scopes = [ 'https://www.googleapis.com/auth/firebase' ]
    this.jwtClient = new google.auth.JWT(serviceAccount.client_email, null, serviceAccount.private_key, scopes)
  }

  public static async getAnalyticsFor(link: string) {
    if (!this.jwtClient) this.analyticsInit()

    try {
      const creds = await this.jwtClient.authorize()
      if (!creds.access_token) {
        console.warn('no access_token found')
        return
      }

      const { data } = await axios.get(`https://firebasedynamiclinks.googleapis.com/v1/${encodeURIComponent(link)}/linkStats?durationDays=30`, {
        headers: { Authorization: `${creds.token_type} ${creds.access_token}` }
      })

      console.log('MEGA YES')
      console.log(JSON.stringify(data, null, 2))
    } catch (ex) {
      console.error(ex)
    }
  }

}
