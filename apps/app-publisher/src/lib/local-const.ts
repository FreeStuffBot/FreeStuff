import { Const, SanitizedProductType } from "@freestuffbot/common"


export default class LocalConst {

  public static get TEST_RUN_PRODUCT(): SanitizedProductType {
    return {
      id: 69420,
      title: 'Test Product',
      prices: [
        { currency: 'usd', oldValue: 1337, newValue: 0, converted: false },
        { currency: 'eur', oldValue: 2, newValue: 1, converted: true }
      ],
      kind: 'game',
      tags: [
        'Test',
        'Gaming',
        ':)'
      ],
      thumbnails: {
        blank: 'https://freestuffbot.xyz/favicon.png',
        full: 'https://freestuffbot.xyz/favicon.png',
        org: 'https://freestuffbot.xyz/favicon.png',
        tags: 'https://freestuffbot.xyz/favicon.png'
      },
      description: 'Lorem ipsum '.repeat(1 + Math.random() * 10),
      rating: ~~(Math.random() * 100) / 100,
      until: Date.now() + Math.random() * 400000,
      type: 'other',
      urls: {
        org: Const.links.website,
        browser: Const.links.website,
        default: Const.links.website,
        client: Const.links.website
      },
      platform: 'steam',
      flags: 0,
      notice: 'This is a test!',
      platformMeta: { },
      staffApproved: false
    }
  }

}
