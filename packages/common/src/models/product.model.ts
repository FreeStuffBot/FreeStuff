/* eslint-disable spaced-comment */
import { Schema, Document as MongooseDocument } from 'mongoose'
import { LocalizedProductDetails, LocalizedProductDetailsSchema } from '../types/global/localized-product-details'
import { ProductAnalytics } from '../types/global/product-analytics'
import { ProductFlags } from '../types/global/product-flag'


// ===== ARRAY CONSTANTS ===== //

export const ProductKind = [ 'game', 'dlc', 'software', 'art', 'ost', 'book', 'other' ] as const
export const ProductKindArray = ProductKind as readonly string[]
export type ProductKindType = typeof ProductKind[number]

export const ProductApprovalStatus = [ 'pending', 'issues', 'approved' ] as const
export const ProductApprovalStatusArray = ProductApprovalStatus as readonly string[]
export type ProductApprovalStatusType = typeof ProductApprovalStatus[number]

export const ProductDiscountType = [ 'free', 'weekend', 'discount', 'ad', 'unknown' ] as const
export const ProductDiscountTypeArray = ProductDiscountType as readonly string[]
export type ProductDiscountTypeType = typeof ProductDiscountType[number]


// ===== HELPER TYPES ===== //

export type ProductSource = {
  platform: string
  url: string
  id: string
}

export type ProductPlatformMeta = {
  steamSubids: string
}

export type ProductThumbnails = {
  org: string
  blank: string
  full: string
  tags: string
}

export type ProductUrls = {
  default: string
  browser: string
  client?: string
  org: string
}

export type ProductPrice = {
  /** name of the currency */
  currency: string
  /** price in this currency */
  value: number
  /** whether this was converted from another currency or not */
  converted: boolean
}


// ===== EXPORT TYPES ===== //

/** A reduced type to use internally */
export type ProductDataType = {
  /** a unique number to identify the game - used by the proxy */
  _id: number
  /** internal uuid - used for checking if a game was already announced */
  uuid: string
  /** Current status of the product */
  status: ProductApprovalStatusType
  /** User id of the moderator, responsible for checking the info and publishing the announcement */
  responsible: string
  /** UNIX Timestamp in second of the last time changes have been made to this product */
  changed: string
  /** Info about the product */
  data: SanitizedProductType
  /** Analytics */
  analytics: ProductAnalytics
}

/** The user mongoose object, muteable and saveable */
export type ProductType = ProductDataType & MongooseDocument<any, {}>

/** The sanitized version of the data, gets served out by the api */
export type SanitizedProductType = {
  /** product's uuid */
  id: number
  /** product's title */
  title: string
  /** old price before the discount */
  oldPrices: ProductPrice[]
  /** new discounted price */
  newPrices: ProductPrice[]
  /** what kind of product is this? */
  kind: ProductKindType
  /** tags that further describe the product */
  tags: string[]
  /** thumbnails for the product */
  thumbnails: ProductThumbnails
  /** a description of the game */
  description: string
  /** rating from 0-1 */
  rating?: number
  /** timestamp of how long this offer is valid */
  until: number
  /** type of discount */
  type: ProductDiscountTypeType
  /** urls to the product */
  urls: ProductUrls
  /** the platform the product is hosted on */
  platform: string
  /** flags */
  flags: ProductFlags
  /** optional notice given out by the team */
  notice?: string
  /** metadata about the game's platform */
  platformMeta: ProductPlatformMeta
  /** wheather this product was manually checked and approved by a staff member */
  staffApproved: boolean
  /** only served out by the api, not used internally */
  localized?: LocalizedProductDetails[]
}


// ===== MONGO SCHEMA ===== //

const ProductPriceSchema = new Schema({
  currency: String,
  value: Number,
  converted: Boolean
})

const ProductThumbnailsSchema = new Schema({
  org: String,
  blank: String,
  full: String,
  tags: String
})

const ProductUrlsSchema = new Schema({
  default: String,
  browser: String,
  client: String,
  org: String
})

const ProductPlatformMetaSchema = new Schema({
  steamSubids: String
})

const ProductDataSchema = new Schema({
  id: Number,
  title: String,
  oldPrices: [ ProductPriceSchema ],
  newPrices: [ ProductPriceSchema ],
  kind: {
    type: String,
    enum: ProductKindArray
  },
  tags: [ String ],
  thumbnails: ProductThumbnailsSchema,
  description: String,
  rating: Number,
  until: Number,
  type: {
    type: String,
    enum: ProductKindArray
  },
  urls: ProductUrlsSchema,
  platform: String,
  flags: Number,
  notice: String,
  platformMeta: ProductPlatformMetaSchema,
  staffApproved: Boolean,
  localized: [ LocalizedProductDetailsSchema ]
})

const ProductAnalyticsSchema = new Schema({
  discord: {
    reach: Number
  }
})

export const ProductSchema = new Schema({
  _id: Number,
  uuid: String,
  status: String,
  responsible: String,
  changed: String,
  data: ProductDataSchema,
  analytics: ProductAnalyticsSchema
})
