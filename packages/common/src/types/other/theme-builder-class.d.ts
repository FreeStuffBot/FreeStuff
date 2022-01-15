import { InteractionApplicationCommandCallbackData } from "cordo"
import { SanitizedGuildType } from "../../models/guild.model"
import { SanitizedProductType } from "../../models/product.model"


export type ThemeSettings = {
  test?: boolean,
  donationNotice?: boolean
}

export interface ThemeBuilderClass {
  build(product: SanitizedProductType[], guild: SanitizedGuildType, settings: ThemeSettings): InteractionApplicationCommandCallbackData
}