import { Fragile } from "@freestuffbot/common"
import { GuildData } from "@freestuffbot/typings"
import Errors from "../lib/errors"


export default class DatabaseGateway {

  public static async fetchGuildData(guildid: string): Promise<Fragile<GuildData>> {
    // TODO fetch from proxy
    // TODO parse raw data
    return [ Errors.createStderrNoGuilddata(), null ]
  }

  public static pushChange(guildid: string, key: string, value: any) {
  }

}
