import { InteractionApplicationCommandCallbackData } from "cordo"
import { OutgoingGameData, GuildData } from "."


export interface ThemeBuilder {
  build(content: OutgoingGameData[], data: GuildData, settings: { test?: boolean, donationNotice?: boolean }): InteractionApplicationCommandCallbackData
}