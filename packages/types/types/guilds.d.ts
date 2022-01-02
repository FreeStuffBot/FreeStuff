import { Long } from 'bson'
import { Currency, Platform, PriceClass, Theme } from './structs'


/** The data that gets stored in the database */
export interface DatabaseGuildData {
  _id: Long
  sharder: Long
  channel: Long | null
  webhook: string | null
  role: Long | null
  settings: number
  filter: number
  tracker: number
}


/**
 * After the data is parsed to allow easier access
 * @usage While this object might get updated once data changes, it is NOT guaranteed to. Treat it as a copy of the data at a specific time, not as an interface to the guild. => No caching this data manually in commands or components, no storing it for longer than needed
 */
export interface GuildData extends DatabaseGuildData {
  theme: Theme
  currency: Currency
  price: PriceClass
  react: boolean
  trashGames: boolean
  language: string
  platformsRaw: number
  platformsList: Platform[]
  beta: boolean
}
