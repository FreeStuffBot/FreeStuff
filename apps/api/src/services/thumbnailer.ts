import { SanitizedProductType } from '@freestuffbot/common'
import axios from 'axios'
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
    const { data, status } = await axios
      .post('/render', props, {
        validateStatus: null,
        baseURL: config.network.thumbnailer
      })
      .catch(() => ({
        data: null,
        status: 999
      }))

    if (status !== 200)
      return null

    return data.url
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
