import { ProductDataType, ProductDiscountTypeType, ProductKindType } from "@freestuffbot/common"
import GibuGqlCore from "./gibu-gql-core"
import GibuGqlQueries from "./gibu-gql-queries"


type GibuProcessedProduct = {
  uuid: string
  data: ProductDataType['data']
}

export default class GibuProductDetails {

  public static async getDetails(url: string, id: number): Promise<GibuProcessedProduct | null> {
    const data = await GibuGqlCore.query(GibuGqlQueries.PRODUCT_DETAILS, { url })
    if (!data) return null

    const thumbnail = GibuProductDetails.findBestThumbnail(data.images)

    return {
      uuid: data.uuid,
      data: {
        id,
        title: data.title,
        prices: data.prices.map((price) => ({
          currency: price.currency,
          oldValue: price.initial,
          newValue: price.final,
          converted: false
        })),
        kind: data.kind as ProductKindType,
        tags: data.tags,
        thumbnails: {
          org: thumbnail,
          blank: '',
          full: '',
          tags: ''
        },
        description: data.descriptionShort,
        rating: data.ratings[0]?.score ?? 0,
        until: data.sale.until,
        type: data.sale.type as ProductDiscountTypeType,
        urls: {
          org: url,
          browser: url,
          default: url
        },
        platform: data.store, // TODO
        flags: 0,
        notice: null,
        platformMeta: {
          steamSubids: data.storeMeta.steamSubids ?? ''
        },
        staffApproved: false
      }
    }
  }

  private static findBestThumbnail(images: typeof GibuGqlQueries.PRODUCT_DETAILS.type['images']): string {
    if (!images?.length) return ''

    // round one - favourite picks
    for (const image of images) {
      if (image.name === 'background_landscape')
        return image.url
      if (image.name === 'thumbnail')
        return image.url
    }

    // round two - alternative picks
    for (const image of images) {
      if (image.name === 'trailer_thumbnail')
        return image.url
      if (image.name === 'promo_0')
        return image.url
    }

    return images[0].url
  }

}
