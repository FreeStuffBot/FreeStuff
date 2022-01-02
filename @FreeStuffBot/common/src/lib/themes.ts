import { InteractionApplicationCommandCallbackData } from "cordo"
import { GameInfo, GuildData, ThemeBuilder } from "@freestuffbot/typings"
import ThemeOne from "../themes/1"
import ThemeTwo from "../themes/2"
import ThemeThree from "../themes/3"
import ThemeFour from "../themes/4"
import ThemeFive from "../themes/5"
import ThemeSix from "../themes/6"
import ThemeSeven from "../themes/7"
import ThemeEight from "../themes/8"
import ThemeNine from "../themes/9"
import ThemeTen from "../themes/10"
import { Localisation } from ".."


export default class Themes {

  public static readonly builders: ThemeBuilder[] = [
    new ThemeOne(),
    new ThemeTwo(),
    new ThemeThree(),
    new ThemeFour(),
    new ThemeFive(),
    new ThemeSix(),
    new ThemeSeven(),
    new ThemeEight(),
    new ThemeNine(),
    new ThemeTen()
  ]

  //

  public static build(content: GameInfo[], data: GuildData, settings: { test?: boolean, donationNotice?: boolean }): InteractionApplicationCommandCallbackData {
    const payload = Themes.builders[data.theme.id].build(content, data, settings)
    Localisation.translateObject(payload, data, payload._context, 14)
    return payload
  }

}
