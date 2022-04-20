import { SanitizedGuildType } from "../models/guild.model"
import { SanitizedProductType } from "../models/product.model"
import CMS from "./cms"


export default class Pricing {

  public static getPreferredCurrency(guild: SanitizedGuildType, product?: SanitizedProductType) {
    const currencies = CMS.constants.currencies

    currencies.find(c => c.id)

    // perhaps even change the entire currency model again
    // we need the number index to parse guilddata
  }

}
