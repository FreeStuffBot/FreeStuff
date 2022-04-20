/* eslint-disable spaced-comment */
import { Schema, Document as MongooseDocument } from 'mongoose'
import { Long } from 'bson'
import { SettingPriceClass, SettingTheme } from '..'
import { SanitizedCurrencyType } from './currency.model'
import { SanitizedPlatformType } from './platform.model'


// ===== ARRAY CONSTANTS ===== //


// ===== HELPER TYPES ===== //


// ===== EXPORT TYPES ===== //

/** A reduced type to use internally */
export type GuildDataType = {
  _id: Long
  sharder: Long
  channel: Long | null
  webhook: string | null
  role: Long | null
  settings: number
  filter: number
  tracker: number
}

/** The user mongoose object, muteable and saveable */
export type GuildType = GuildDataType & MongooseDocument<any, {}>

/** The sanitized version of the data, gets served out by the api */
export type SanitizedGuildType = {
  id: Long
  sharder: Long
  channel: Long | null
  webhook: string | null
  role: Long | null
  settings: number
  filter: number
  tracker: number

  theme: SettingTheme<any>
  currency: SanitizedCurrencyType
  price: SettingPriceClass<any>
  react: boolean
  trashGames: boolean
  language: string
  platformsRaw: number
  platformsList: SanitizedPlatformType[]
  beta: boolean
}

/** Sanitized version of the data but with changes -> internally */
export type SanitizedGuildWithChangesType = SanitizedGuildType & {
  _changes: Partial<GuildDataType>
}


// ===== MONGO SCHEMA ===== //

export const GuildSchema = new Schema({
  _id: Schema.Types.Long,
  sharder: Schema.Types.Long,
  channel: Schema.Types.Long, // nullable
  webhook: String, // nullable
  role: Schema.Types.Long, // nullable
  settings: Number,
  filter: Number,
  tracker: Number
}, { collection: 'guilds' })
