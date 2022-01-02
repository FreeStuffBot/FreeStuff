import { InteractionApplicationCommandCallbackData } from "cordo"
import { GameInfo, GuildData } from "."


export interface ThemeBuilder {
  build(content: GameInfo[], data: GuildData, settings: { test?: boolean, donationNotice?: boolean }): InteractionApplicationCommandCallbackData
}