import { SanitizedProductType } from '@freestuffbot/common'
import axios from 'axios'
import { google } from 'googleapis'
import { config } from '../.'
import StringUtils from './stringutils'


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

export enum FirebaseReadError {
  BAD_GATEWAY = 1000502,
  NOT_FOUND = 1000404
}

export type FirebaseLinkAnalytics = {
  web: number
  android: number
  ios: number
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
    if (!config?.firebase?.key) return ''

    const { data, status } = await axios.post(`https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${config.firebase.key}`, {
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

  public static createLinkForGame(product: SanitizedProductType): Promise<string> {
    return this.createLink('redirect.freestuffbot.xyz/game', product.urls.org, StringUtils.sanitizeProductName(product.title), {
      socialTitle: `Get ${product.title} for 100% off!`,
      socialDescription: product.description,
      socialImageLink: product.thumbnails.org
    })
  }

  //

  private static jwtClient: any // typeof google.auth.JWT
  private static jwtCreds: any

  public static analyticsInit() {
    const sanitizedJSON = config.firebase.serviceAccount
      .replace(/\r/g, '')
      .replace(/([^,{])\n(?! *})/g, '$1\\n')

    const serviceAccount = JSON.parse(sanitizedJSON)
    const scopes = [ 'https://www.googleapis.com/auth/firebase' ]

    this.jwtClient = new google.auth.JWT(serviceAccount.client_email, null, serviceAccount.private_key, scopes)
  }

  private static async regenAnalyticsCreds() {
    this.jwtCreds = await this.jwtClient.authorize()
    if (!this.jwtCreds.access_token) {
      console.warn('no access_token found')
      return
    }
  }

  public static async getAnalyticsFor(link: string, allowCredsRegen = true): Promise<FirebaseReadError | FirebaseLinkAnalytics> {
    if (!FirebasePagelink.jwtClient) FirebasePagelink.analyticsInit()
    link = link.split('#')[0]

    try {
      if (!FirebasePagelink.jwtCreds) await FirebasePagelink.regenAnalyticsCreds()

      const { status, data } = await axios.get(`https://firebasedynamiclinks.googleapis.com/v1/${encodeURIComponent(link)}/linkStats?durationDays=30`, {
        headers: {
          authorization: `${this.jwtCreds.token_type} ${this.jwtCreds.access_token}`,
          accept: 'application/json'
        },
        validateStatus: null
      })

      if (status < 200 || status >= 300) {
        if (!allowCredsRegen) return FirebaseReadError.BAD_GATEWAY
        await FirebasePagelink.regenAnalyticsCreds()
        return FirebasePagelink.getAnalyticsFor(link, false)
      }

      const stats = data?.linkEventStats
      if (!stats?.length) return FirebaseReadError.NOT_FOUND

      const byPlatform: Map<string, [ string, number ]> = new Map()
      for (const stat of stats) {
        if (!byPlatform.has(stat.platform)) {
          byPlatform.set(stat.platform, [ stat.event, stat.count ])
          continue
        }

        const current = byPlatform.get(stat.platform)
        if (current[0] === 'CLICK') continue

        if (stat.event === 'CLICK' || stat.event === 'REDIRECT') {
          byPlatform.set(stat.platform, [ stat.event, stat.count ])
          continue
        }
      }

      const out: FirebaseLinkAnalytics = {
        web: -1,
        android: -1,
        ios: -1
      }

      if (byPlatform.has('WEB')) out.web = byPlatform.get('WEB')[1]
      else if (byPlatform.has('OTHER')) out.web = byPlatform.get('OTHER')[1]

      if (byPlatform.has('ANDROID')) out.android = byPlatform.get('ANDROID')[1]
      if (byPlatform.has('IOS')) out.ios = byPlatform.get('IOS')[1]

      return out
    } catch (ex) {
      console.error(ex)
    }
  }

}
