import { Fragile, DataGuild, DataChannel, FlipflopCache, DataWebhook, Errors, Logger } from "@freestuffbot/common"
import axios from "axios"
import { config } from ".."


export default class DiscordGateway {

  public static readonly guildCache: FlipflopCache<DataGuild> = new FlipflopCache(config.discordGuildCacheInterval)

  public static async getGuild(guildid: string, ignoreCache = false): Promise<Fragile<DataGuild>> {
    if (!ignoreCache && DiscordGateway.guildCache.has(guildid))
      return Errors.success(DiscordGateway.guildCache.get(guildid))

    const fresh = await this.fetchGuild(guildid, ignoreCache)
    if (fresh[0]) return fresh

    DiscordGateway.guildCache.put(guildid, fresh[1])
    return fresh
  }

  private static async fetchGuild(guildid: string, ignoreCache: boolean): Promise<Fragile<DataGuild>> {
    try {
      const flags = ignoreCache ? 'softcache' : ''
      const { data, status, statusText } = await axios.get(`/guild/${guildid}?${flags}`, {
        baseURL: config.network.discordGateway,
        validateStatus: null
      })

      if (status === 200)
        return Errors.success(data)

      return Errors.throw({
        status,
        name: statusText,
        source: 'discord-interactions::discord-gateway',
        description: 'An issue occured while trying to load your server\'s roles.',
        fix: 'Please try again in a bit or contact support if the issue persists.'
      })
    } catch (ex) {
      return Errors.throw({
        status: Errors.STATUS_ERRNO,
        name: ex.code ?? 'unknown',
        source: 'discord-interactions::discord-gateway',
        description: 'An issue occured while trying to load your server\'s roles.',
        fix: 'Please try again in a bit or contact support if the issue persists.'
      })
    }
  }

  //

  public static readonly channelsCache: FlipflopCache<DataChannel[]> = new FlipflopCache(config.discordChannelsCacheInterval)

  public static async getChannels(guildid: string, lookupThreads?: string | string[], ignoreCache = false): Promise<Fragile<DataChannel[]>> {
    if (lookupThreads) {
      lookupThreads = (typeof lookupThreads === 'object')
        ? lookupThreads.join('+')
        : lookupThreads
    }

    const cacheBucket = lookupThreads
      ? `${guildid}:${lookupThreads}`
      : guildid
    
    if (!ignoreCache && DiscordGateway.channelsCache.has(cacheBucket))
      return Errors.success(DiscordGateway.channelsCache.get(cacheBucket))

    const fresh = await this.fetchChannels(guildid, lookupThreads as string, ignoreCache)
    if (fresh[0]) return fresh

    DiscordGateway.channelsCache.put(cacheBucket, fresh[1])
    return fresh
  }

  private static async fetchChannels(guildid: string, lookupThreads: string | undefined, ignoreCache: boolean): Promise<Fragile<DataChannel[]>> {
    try {
      const flags = []
      if (ignoreCache) flags.push('softcache=1')
      if (lookupThreads) flags.push(`lookup_threads=${lookupThreads}`)
      const { data, status, statusText } = await axios.get(`/channels/${guildid}?${flags.join('&')}`, {
        baseURL: config.network.discordGateway,
        validateStatus: null
      })

      if (status === 200)
        return Errors.success(data)

      return Errors.throw({
        status,
        name: statusText,
        source: 'discord-interactions::discord-gateway',
        description: 'An issue occured while trying to load your server\'s channels.',
        fix: 'Please try again in a bit or contact support if the issue persists.'
      })
    } catch (ex) {
      return Errors.throw({
        status: Errors.STATUS_ERRNO,
        name: ex.code ?? 'unknown',
        source: 'discord-interactions::discord-gateway',
        description: 'An issue occured while trying to load your server\'s channels.',
        fix: 'Please try again in a bit or contact support if the issue persists.'
      })
    }
  }

  //

  public static readonly webhooksCache: FlipflopCache<DataWebhook[]> = new FlipflopCache(config.discordWebhooksCacheInterval)

  public static async getWebhooks(channelid: string, ignoreCache = false): Promise<Fragile<DataWebhook[]>> {
    if (!ignoreCache && DiscordGateway.webhooksCache.has(channelid))
      return Errors.success(DiscordGateway.webhooksCache.get(channelid))

    const fresh = await this.fetchWebhooks(channelid, ignoreCache)
    if (fresh[0]) return fresh

    DiscordGateway.webhooksCache.put(channelid, fresh[1])
    return fresh
  }

  private static async fetchWebhooks(channelid: string, ignoreCache: boolean): Promise<Fragile<DataWebhook[]>> {
    try {
      const flags = ignoreCache ? 'softcache' : ''
      const { data, status, statusText } = await axios.get(`/webhooks/${channelid}?${flags}`, {
        baseURL: config.network.discordGateway,
        validateStatus: null
      })

      if (status === 200)
        return Errors.success(data)

      return Errors.throw({
        status,
        name: statusText,
        source: 'discord-interactions::discord-gateway',
        description: 'An issue occured while trying to load your server\'s webhooks.'
      })
    } catch (ex) {
      return Errors.throw({
        status: Errors.STATUS_ERRNO,
        name: ex.code ?? 'unknown',
        source: 'discord-interactions::discord-gateway',
        description: 'An issue occured while trying to load your server\'s webhooks.'
      })
    }
  }

  public static async createWebhook(channelid: string): Promise<Fragile<DataWebhook>> {
    try {
      const { data, status, statusText } = await axios.post(`/webhooks/${channelid}`, null, {
        baseURL: config.network.discordGateway,
        validateStatus: null
      })

      if (status === 200)
        return Errors.success(data)

      return Errors.throw({
        status,
        name: statusText,
        source: 'discord-interactions::discord-gateway',
        description: 'An issue occured while trying to create a webhook.'
      })
    } catch (ex) {
      return Errors.throw({
        status: Errors.STATUS_ERRNO,
        name: ex.code ?? 'unknown',
        source: 'discord-interactions::discord-gateway',
        description: 'An issue occured while trying to create a webhook.'
      })
    }
  }

  public static async validateWebhook(accessor: string): Promise<Fragile<boolean>> {
    Logger.debug(`Validate: access ${accessor} (${accessor?.includes('/')})`)
    if (!accessor || !accessor.includes('/'))
      return Errors.success(false)

    const [ path ] = accessor.split(':')

    const { status, statusText, data } = await axios.get(`/webhooks/${path}?nodata`, {
      baseURL: config.network.discordGateway,
      validateStatus: null
    }).catch(err => ({ status: 999, statusText: err.name, data: null }))

    Logger.debug(`Validate: status ${status}`)
    Logger.debug(`Data: ${data}`)

    if (status === 200)
      return Errors.success(true)

    if (status === 404)
      return Errors.success(false)

    return Errors.throw({
      status: Errors.STATUS_ERRNO,
      name: `${status} ${statusText}`,
      source: 'discord-interactions::discord-gateway',
      description: 'An issue occured while trying to validate a webhook.'
    })
  }

}
