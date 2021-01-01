import { Endpoint, FreeStuffApiSettings, GameAnalytics, GameAnalyticsDiscord, GameAnalyticsTelegram, GameInfo, PartnerEndpoint, RawApiResponse } from "./types"
import axios, { AxiosResponse } from 'axios'
import { hostname } from "os"


export default class FreeStuffApi {

  //#region constructor

  constructor(
    private settings: FreeStuffApiSettings,
  ) {
    if (!this.settings.type)
      this.settings.type = 'basic'

    if (!this.settings.baseUrl)
      this.settings.baseUrl = 'https://management.freestuffbot.xyz/api/v1'

    if (!this.settings.cacheTtl) {
      this.settings.cacheTtl = {
        gameDetails: 1000 * 60 * 60 * 24,
        gameList: 1000 * 60 * 5
      }
    }

    if (!this.settings.cacheTtl.gameDetails)
      this.settings.cacheTtl.gameDetails = 1000 * 60 * 60 * 24

    if (!this.settings.cacheTtl.gameList)
      this.settings.cacheTtl.gameList = 1000 * 60 * 5
  }

  //#endregion
  
  //#region http core

  private getHeaders(): any {
    return {
      'Authorization': this.settings.type == 'basic'
        ? `Basic ${this.settings.key}`
        : `Partner ${this.settings.key} ${this.settings.sid}`
    }
  }

  public async makeRequest(endpoint: Endpoint | PartnerEndpoint | string, body?: any, ...args: string[]): Promise<RawApiResponse> {
    let url = this.settings.baseUrl
    let method = 'GET'
    
    if (endpoint.includes(' ')) {
      method = endpoint.split(' ')[0]
      url += endpoint.substr(method.length + 1)
    } else {
      url += endpoint
    }

    for (const arg of args)
      url = url.replace('%s', arg)

    if (!['GET', 'POST', 'PUT', 'DELETE'].includes(method.toUpperCase()))
      throw new Error(`FreeStuffApi Error. ${method} is not a valid http request method.`)

    let conf = [ { headers: this.getHeaders() } ]
    if (['POST', 'PUT'].includes(method.toUpperCase()))
      conf = [ body || null, ...conf]

    let raw: AxiosResponse<any> | null
    try {
      raw = await axios[method.toLowerCase()](url, ...conf)
    } catch (err) {
      raw = err.response
      if (raw?.status == 403)
        throw new Error('FreeStuffApi Error. Invalid authorization key.')
    }
    
    if (raw?.status == 200) return { ...raw.data, _headers: raw.headers, _status: raw.status }
    if (raw?.data.error) return { ...raw.data, _headers: raw.headers, _status: raw.status }
    return { success: false, error: raw?.statusText || 'error', message: `ApiWrapper Request failed. [http ${raw?.status || '?'}]`, _headers: raw?.headers ?? {}, _status: raw?.status ?? 0 }
  }

  private rateLimitMeta(headers: any): { remaining: number, reset: number } {
    return {
      remaining: parseInt(headers['X-RateLimit-Remaining'], 10) ?? -1,
      reset: Date.now() + (parseInt(headers['X-RateLimit-Reset'], 10) * 1000 - parseInt(headers['X-Server-Time'], 10))
    }
  }

  //#endregion
  
  //#region PING

  public async ping(): Promise<RawApiResponse> {
    return this.makeRequest(Endpoint.PING)
  }

  //#endregion
  //#region GET game list

  private gameList_cacheData = {}
  private gameList_cacheUpdate = {}
  private gameList_ratesRemaining = 5
  private gameList_ratesReset = 0

  public async getGameList(category: 'all' | 'free', useCache = true): Promise<number[]> {
    if (this.gameList_ratesRemaining == 0 && (Date.now() - this.gameList_ratesReset < 0)) {
      return new Promise((res) => setTimeout(() => res(this.getGameList(category)), this.gameList_ratesReset - Date.now()))
    }

    if (useCache) {
      if (this.gameList_cacheData[category] && (Date.now() - this.gameList_cacheUpdate[category] < this.settings.cacheTtl.gameList))
        return this.gameList_cacheData[category]
    }

    const data = await this.makeRequest(Endpoint.GAME_LIST, null, category)
    const rlm = this.rateLimitMeta(data._headers)
    this.gameList_ratesRemaining = rlm.remaining
    this.gameList_ratesReset = rlm.reset
    this.gameList_cacheData[category] = data.data || this.gameList_cacheData[category]
    this.gameList_cacheUpdate[category] = Date.now()

    return <number[] | null> data.data ?? []
  }

  //#endregion
  //#region GET game details

  private gameDetails_cacheData = {}
  private gameDetails_cacheUpdate = {}
  private gameDetails_ratesRemaining = 5
  private gameDetails_ratesReset = 0

  /** @access PUBLIC */
  public async getGameDetails(games: number[], lookup: 'info', useCache?: boolean): Promise<{ [id: string]: GameInfo }>
  /** @access PARTNER ONLY */
  public async getGameDetails(games: number[], lookup: 'analytics', useCache?: boolean): Promise<{ [id: string]: GameAnalytics }>
  /** @access PARTNER ONLY */
  public async getGameDetails(games: number[], lookup: 'all', useCache?: boolean): Promise<{ [id: string]: any }>
  public async getGameDetails(games: number[], lookup: 'info' | 'analytics' | 'all', useCache = true): Promise<{ [id: string]: any }> {
    const out = { }

    if (!games.length) return out
    if (lookup != 'info' && this.settings.type != 'partner')
      throw new Error(`FreeStuffApi Error. Tried to request partner only information. Get game details, lookup: ${lookup}. Allowed lookups: [ 'info' ]`)

    if (useCache) {
      for (const game of games) {
        const cid = `${game}/${lookup}`
        if (this.gameDetails_cacheData[cid] && (Date.now() - this.gameDetails_cacheUpdate[cid] < this.settings.cacheTtl.gameDetails)) {
          out[game + ''] = this.gameDetails_cacheData[cid]
          games.splice(games.indexOf(game), 1)
        }
      }
    }

    if (!games.length) return out

    if (this.gameDetails_ratesRemaining == 0 && (Date.now() - this.gameDetails_ratesReset < 0)) {
      return new Promise((res) => setTimeout(() => res(this.getGameDetails(games, <'info'> lookup, useCache)), this.gameDetails_ratesReset - Date.now()))
    }

    const requestStack = [[]]
    for (const game of games) {
      if (requestStack[requestStack.length - 1].length < 5)
        requestStack[requestStack.length - 1].push(game)
      else
        requestStack.push([game])
    }

    const raw = (await Promise.all(requestStack.map(q => this.makeRequest(Endpoint.GAME_DETAILS, null, q.join('+'), lookup))))

    for (const res of raw) {
      for (const id of Object.keys(<any> res.data || {})) {
        let object = <GameInfo | null> (res.data && res.data[id]) ?? null

        if (object) {
          object.until = object.until ? new Date((<unknown> object.until as number) * 1000) : null
          object.id = parseInt(id, 10)
        }

        out[id] = object
        const cid = `${id}/${lookup}`
        this.gameDetails_cacheData[cid] = object
        this.gameDetails_cacheUpdate[cid] = Date.now()
      }
    }

    const rlm = this.rateLimitMeta(raw[raw.length - 1]._headers)
    this.gameDetails_ratesRemaining = rlm.remaining
    this.gameDetails_ratesReset = rlm.reset

    return out
  }

  //#endregion
  //#region POST status

  /** @access PARTNER ONLY */
  public async postStatus(service: string, status: 'ok' | 'partial' | 'offline' | 'rebooting' | 'fatal', data?: any, version?: string, servername?: string, suid?: string): Promise<RawApiResponse> {
    if (this.settings.type != 'partner')
      throw new Error('FreeStuffApi Error. Tried using partner-only endpoint "postStatus" as non-partner.')

    data = data || {}
    servername = servername || await hostname()
    suid = suid || this.settings.sid
    version = version || this.settings.version || 'unknown'

    const body = {
      data, suid, status, service, version,
      server: servername
    }

    const res = await this.makeRequest(PartnerEndpoint.STATUS, body)

    if (res?.data['events'])
      res?.data['events'].forEach(e => this.emitRawEvent(e))

    return res
  }

  //#endregion
  //#region POST game analytics

  /** @access PARTNER ONLY */
  public async postGameAnalytics(game: number, service: 'discord', data: GameAnalyticsDiscord): Promise<RawApiResponse>
  public async postGameAnalytics(game: number, service: 'telegram', data: GameAnalyticsTelegram): Promise<RawApiResponse>
  public async postGameAnalytics(game: number, service: string, data: any): Promise<RawApiResponse>
  public async postGameAnalytics(game: number, service: string, data: any): Promise<RawApiResponse> {
    if (this.settings.type != 'partner')
      throw new Error('FreeStuffApi Error. Tried using partner-only endpoint "postGameAnalytics" as non-partner.')

    const body = {
      service,
      suid: this.settings.sid,
      data
    }

    return this.makeRequest(PartnerEndpoint.GAME_ANALYTICS, body, game + '')
  }

  //#endregion
  
  //#region event system
  private listener: Map<string, ((...data: any) => any)[]> = new Map()

  public on(event: 'free_games', handler: (ids: number[]) => any)
  public on(event: 'operation', handler: (command: string, args: string[]) => any)
  public on(event: string, handler: (...data: any) => any) {
    if (this.listener.has(event))
      this.listener.get(event).push(handler)
    else
      this.listener.set(event, [ handler ])
  }

  public unregisterEventHandler(event?: string) {
    if (event) this.listener.delete(event)
    else this.listener = new Map()
  }

  public emitEvent(event: string, ...data: any) {
    if (this.listener.has(event))
      this.listener.get(event).forEach(handler => handler(...data))
  }

  public emitRawEvent(event: { event: string, data: any }, orElse?: (event: { event:string, data: any }) => any) {
    switch (event.event) {
      case 'free_games':
        this.emitEvent('free_games', event.data)
        break

      case 'operation':
        this.emitEvent('operation', event.data.command, event.data.arguments)
        break

      default: orElse && orElse(event)
    }
  }
  //#endregion

}
