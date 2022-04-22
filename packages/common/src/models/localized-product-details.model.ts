/* eslint-disable spaced-comment */
import { Schema } from 'mongoose'


// ===== ARRAY CONSTANTS ===== //


// ===== HELPER TYPES ===== //


// ===== EXPORT TYPES ===== //

/** A reduced type to use internally */
export type LocalizedProductDetailsDataType = {
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
  orgPrice: string
  until: string
  flags: string[]
}

/** The user mongoose object, muteable and saveable */
export type LocalizedProductDetailsType = LocalizedProductDetailsDataType

/** The sanitized version of the data, gets served out by the api */
export type SanitizedLocalizedProductDetails = LocalizedProductDetailsDataType


// ===== MONGO SCHEMA ===== //

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
