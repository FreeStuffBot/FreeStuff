import { SanitizedAppType, SanitizedProductType } from "@freestuffbot/common"


export default class HooksV1 {

  public static packageProducts(products: SanitizedProductType[], app: SanitizedAppType): Object {
    return {
      event: 'free_games',
      secret: app.webhookSecret || undefined,
      data: products.map(p => p.id)
    }
  }

}
