import { config } from ".."


/**
 * We will just cache all rest requests because why not
 */
export default class RestCache {

  private static cacheData: Map<string, any> = new Map()
  private static cacheAge: Map<string, number> = new Map()

  /**
   * @returns data on success, null on cache hit but empty data, undefined on non cache hit
   */
  public static get(endpoint: string, softcache = false): any | null | undefined {
    if (!RestCache.cacheData.has(endpoint)) return undefined
    if (Date.now() - RestCache.cacheAge.get(endpoint) > (softcache ? config.cacheTtlRestMin : config.cacheTtlGuildMax)) return undefined
    return RestCache.cacheData.get(endpoint)
  }

  public static set(endpoint: string, data: any | null) {
    RestCache.cacheData.set(endpoint, data)
    RestCache.cacheAge.set(endpoint, Date.now())
  }

  public static purge() {
    for (const key of RestCache.cacheAge.keys()) {
      if (Date.now() - RestCache.cacheAge.get(key) < config.cacheTtlRestMax) return

      RestCache.cacheData.delete(key)
      RestCache.cacheAge.delete(key)
    }
  }

  public static get size(): number {
    return RestCache.cacheData.size
  }

}
