import { Schema } from "mongoose"

export type LocalizedProductDetails = {
  langId: string
  langName: string
  langNameEn: string
  langFlagEmoji: string
  platform: string
  claimLong: string
  claimShort: string
  free: string
  header: string
  footer: string
  orgPriceEur: string
  orgPriceUsd: string
  until: string
  flags: string[]
}

export const LocalizedProductDetailsSchema = new Schema({
  langId: String,
  langName: String,
  langNameEn: String,
  langFlagEmoji: String,
  platform: String,
  claimLong: String,
  claimShort: String,
  free: String,
  header: String,
  footer: String,
  orgPriceEur: String,
  orgPriceUsd: String,
  until: String,
  flags: [ String ]
})
