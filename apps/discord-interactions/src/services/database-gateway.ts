import { FlipflopCache, Fragile, SanitizedGuildType, GuildSanitizer, LanguageDataType, FragileError, SanitizedGuildWithChangesType, GuildDataType, SettingPriceClass, Util, SettingTheme, Localisation, SanitizedCurrencyType, SanitizedPlatformType, Errors } from "@freestuffbot/common"
import { Long } from "bson"
import { config } from ".."
import { DatabaseActions } from "../types/database-actions"
import Mongo from "./mongo"


type Flattener<T extends keyof DatabaseActions> = Record<T, (data: SanitizedGuildWithChangesType, value: DatabaseActions[T]) => void>

export default class DatabaseGateway {

  private static guildCache: FlipflopCache<SanitizedGuildType> = new FlipflopCache(config.dataGuildCacheInterval, DatabaseGateway.saveGuildChanges)
  private static pendingGuilds: Map<string, Promise<Fragile<SanitizedGuildType>>> = new Map()

  public static async getGuild(guildid: string): Promise<Fragile<SanitizedGuildType>> {
    if (DatabaseGateway.guildCache.has(guildid))
      return Errors.success(DatabaseGateway.guildCache.get(guildid))
    if (DatabaseGateway.pendingGuilds.has(guildid))
      return DatabaseGateway.pendingGuilds.get(guildid)

    const prom = this.fetchGuild(guildid)
    DatabaseGateway.pendingGuilds.set(guildid, prom)
    const fresh = await prom
    if (fresh[0]) return fresh

    DatabaseGateway.guildCache.put(guildid, fresh[1])
    DatabaseGateway.pendingGuilds.delete(guildid)
    return fresh
  }

  public static async fetchGuild(guildid: string): Promise<Fragile<SanitizedGuildType>> {
    const raw = await Mongo.findById('guilds', Long.fromString(guildid))

    // TODO metrics

    if (!raw)
      return Errors.throwStderrNoGuilddata('discord-interactions::database-gateway')

    const sanitized = GuildSanitizer.sanitize(raw)
    return Errors.success(sanitized)
  }

  public static async pushGuildDataChange<T extends keyof DatabaseActions>(guildid: string, key: T, value: DatabaseActions[T]) {
    const [ err, data ] = await DatabaseGateway.getGuild(guildid) as [ FragileError, SanitizedGuildWithChangesType ]
    if (err) return Errors.handleErrorWithoutCommunicate(err)

    const flat = DatabaseGateway.flattener[key]
    if (!flat) return

    if (!data._changes) data._changes = {}
    flat(data, value)
  }

  private static saveGuildChanges(guild: SanitizedGuildWithChangesType) {
    if (!guild._changes) return

    const changes = guild._changes
    delete guild._changes

    Mongo
      .collection('guilds')
      .updateOne(
        { _id: guild.id },
        { $set: changes }
      )
  }

  //

  private static readonly flattener: Flattener<keyof DatabaseActions> = {
    channel(data: SanitizedGuildWithChangesType, value: Long | null) {
      data.channel = value
      data._changes.channel = value
    },
    role(data: SanitizedGuildWithChangesType, value: Long | null) {
      data.role = value
      data._changes.role = value
    },
    price(data: SanitizedGuildWithChangesType, value: SettingPriceClass<any>) {
      data.price = value
      data.filter = Util.modifyBitsMask(data.filter, GuildSanitizer.BITS_PRICE_OFFSET, GuildSanitizer.BITS_PRICE_MASK, value.id)
      data._changes.filter = data.filter
    },
    theme(data: SanitizedGuildWithChangesType, value: SettingTheme<any>) {
      data.theme = value
      data.settings = Util.modifyBitsMask(data.settings, GuildSanitizer.BITS_THEME_OFFSET, GuildSanitizer.BITS_THEME_MASK, value.id)
      data._changes.settings = data.settings
    },
    currency(data: SanitizedGuildWithChangesType, value: SanitizedCurrencyType) {
      data.currency = value
      data.settings = Util.modifyBitsMask(data.settings, GuildSanitizer.BITS_CURRENCY_OFFSET, GuildSanitizer.BITS_CURRENCY_MASK, value.id)
      data._changes.settings = data.settings
    },
    react(data: SanitizedGuildWithChangesType, value: boolean) {
      data.react = value
      data.settings = Util.modifyBitsMask(data.settings, GuildSanitizer.BIT_REACT_OFFSET, 1, value ? 1 : 0)
      data._changes.settings = data.settings
    },
    trash(data: SanitizedGuildWithChangesType, value: boolean) {
      data.trashGames = value
      data.filter = Util.modifyBitsMask(data.filter, GuildSanitizer.BIT_TRASH_OFFSET, 1, value ? 1 : 0)
      data._changes.filter = data.filter
    },
    language(data: SanitizedGuildWithChangesType, value: number) {
      data.language = Localisation.languageById(value)
      data.settings = Util.modifyBitsMask(data.settings, GuildSanitizer.BITS_LANGUAGE_OFFSET, GuildSanitizer.BITS_LANGUAGE_MASK, value)
      data._changes.settings = data.settings
    },
    platforms(data: SanitizedGuildWithChangesType, value: SanitizedPlatformType[]) {
      const bits = value.reduce((plat, val) => ((1 << val.id) | plat), 0)
      data.platformsList = value
      data.platformsRaw = bits
      data.filter = Util.modifyBitsMask(data.filter, GuildSanitizer.BITS_PLATFORMS_OFFSET, GuildSanitizer.BITS_PLATFORMS_MASK, bits)
      data._changes.filter = data.filter
    },
    beta(data: SanitizedGuildWithChangesType, value: boolean) {
      data.beta = value
      data.settings = Util.modifyBitsMask(data.settings, GuildSanitizer.BIT_BETA_OFFSET, 1, value ? 1 : 0)
      data._changes.settings = data.settings
    },
    tracker(data: SanitizedGuildWithChangesType, value: number) {
      data.tracker = value
      data._changes.tracker = value
    },
    webhook(data: SanitizedGuildWithChangesType, value: string) {
      data.webhook = value
      data._changes.webhook = value
    }
  }

}
