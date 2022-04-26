import { SanitizedProductType } from '@freestuffbot/common'
import axios from 'axios'
import * as crypto from 'crypto'
import { config } from '..'


export type ThumbnailerProperties = {
  data: {
    thumbnail: string
    tags?: string[]
  }
  options?: {
    tags?: boolean
    watermark?: boolean | 'tl' | 'tr' | 'bl' | 'br'
    full?: boolean
  }
}

export default class Thumbnailer {

  public static async generateUrl(props: ThumbnailerProperties): Promise<string> {
    try {
      const url = config.network.thumbnailer + '/render'
      const { data, status } = await axios.post(url, props, { validateStatus: null })
      console.log(data, status)
      if (status !== 200)
        return null
      return data.url
    } catch (ex) {
      console.error(ex)
      return null
    }
  }

  public static async generateObject(data: ThumbnailerProperties['data'], shellOnly: boolean): Promise<SanitizedProductType['thumbnails']> {
    if (shellOnly) {
      return {
        org: data.thumbnail,
        blank: data.thumbnail,
        full: data.thumbnail,
        tags: data.thumbnail
      }
    }

    const images = await Promise.all([
      this.generateUrl({ data }),
      this.generateUrl({ data, options: { full: true } }),
      this.generateUrl({ data, options: { tags: true } })
    ])

    return {
      org: data.thumbnail,
      blank: images[0] || data.thumbnail,
      full: images[1] || data.thumbnail,
      tags: images[2] || data.thumbnail
    }
  }

}
