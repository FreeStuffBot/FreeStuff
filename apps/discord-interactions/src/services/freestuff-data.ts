import { Fragile, Logger } from "@freestuffbot/common"
import { GameInfo } from "@freestuffbot/typings"
import Errors from "../lib/errors"


export default class FreestuffData {
  
  private static readonly TWELVE_HOURS = 1000 * 60 * 60 * 12
  private static current: Fragile<GameInfo[]> = Errors.throwStderrNotInitialized()

  public static async updateCurrentFreebies() {
    Logger.excessive('Updating current freebie list')
    // const ids = await FSAPI.getGameList('free')
    // const data = await FSAPI.getGameDetails(ids, 'info')
    const failed = false
    // TODO

    const data = []
    let games = Object.values(data)

    const currentTime = new Date()
    games = games
      .filter(g => g.until && g.until.getTime() > currentTime.getTime())
      .sort((a, b) => b.until.getTime() - a.until.getTime())
    games.forEach((g) => {
      if (g.until.getTime() - currentTime.getTime() < this.TWELVE_HOURS)
        (g as any)._today = true
    })

    this.current = [ null, games ]
  }

  public static getCurrentFreebies(): Fragile<GameInfo[]> {
    return this.current
  }

}
