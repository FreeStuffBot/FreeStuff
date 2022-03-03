import { SanitizedProductType } from '@freestuffbot/common'
import axios from 'axios'
import { config } from '..'


export type ThumbnailerProperties = {
  data: {
    tags?: string[]
    thumbnail: {
      org: string
    }
  }
  options?: {
    tags?: boolean
    full?: boolean
  }
}

export default class Thumbnailer {

  private static cache: Map<string, string> = new Map()

  private static getCacheHash(props: ThumbnailerProperties): string {
    const crypto = require('crypto')
    const name = JSON.stringify(props)
    const hash = crypto.createHash('md5').update(name).digest('hex')
    return hash
  }

  public static async generateUrl(props: ThumbnailerProperties): Promise<string> {
    const hash = this.getCacheHash(props)
    if (this.cache.has(hash))
      return this.cache.get(hash)

    try {
      const url = config.network.thumbnailer + '/render'
      const { data, status } = await axios.post(url, props, { responseType: 'arraybuffer', validateStatus: null })
      if (status !== 200)
        return ''
  
      // const cdnUrl = await uploadImageToCdn(Buffer.from(data, 'binary'), 'freestuff-thumbnail.png')
      // this.cache.set(hash, cdnUrl)
      // return cdnUrl
      return '' // TODO
    } catch (ex) {
      return ''
    }
  }

  public static async generateObject(data: ThumbnailerProperties['data'], shellOnly: boolean): Promise<SanitizedProductType['thumbnails']> {
    if (shellOnly) return {
      org: data.thumbnail.org,
      blank: data.thumbnail.org,
      full: data.thumbnail.org,
      tags: data.thumbnail.org
    }

    const images = await Promise.all([
      this.generateUrl({ data }),
      this.generateUrl({ data, options: { full: true } }),
      this.generateUrl({ data, options: { tags: true } })
    ])

    return {
      org: data.thumbnail.org,
      blank: images[0] || data.thumbnail.org,
      full: images[1] || data.thumbnail.org,
      tags: images[2] || data.thumbnail.org
    }
  }

}
