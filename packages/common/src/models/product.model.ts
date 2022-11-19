/* eslint-disable spaced-comment */
import { Schema, Document as MongooseDocument } from 'mongoose'
import { ProductFlags } from '../types/other/product-flag'
import { SanitizedLocalizedProductDetails } from './localized-product-details.model'


// ===== ARRAY CONSTANTS ===== //

export const ProductKind = [ 'game', 'dlc', 'software', 'art', 'ost', 'book', 'other' ] as const
export const ProductKindArray = ProductKind as readonly string[]
export type ProductKindType = typeof ProductKind[number]

/**
 * pending - data has been fetched in but not verified by a content moderator yet
 * issues - unused at the moment
 * approved - a content moderator has approved the data but the product is not yet published
 * processing - the product is in a loading state. automatic data scrapers are collecting data, no action shall be taken yet
 * published - this product has been published and can no longer be edited
 */
export const ProductApprovalStatus = [ 'pending', 'issues', 'approved', 'processing', 'published' ] as const
export const ProductApprovalStatusArray = ProductApprovalStatus as readonly string[]
export type ProductApprovalStatusType = typeof ProductApprovalStatus[number]

export const ProductDiscountType = [ 'keep', 'timed', 'prime', 'gamepass', 'other', 'debug' ] as const
export const ProductDiscountTypeArray = ProductDiscountType as readonly string[]
export type ProductDiscountTypeType = typeof ProductDiscountType[number]


// ===== HELPER TYPES ===== //

export type ProductSource = {
  platform: string
  url: string
  id: string
}

export type ProductPlatformMeta = {
  steamSubids?: string
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
  /** price in this currency before the discount */
  oldValue: number
  /** price in this currency after the discount */
  newValue: number
  /** whether this was converted from another currency or not */
  converted: boolean
}

export type ProductAnalytics = {
  discord: {
    reach: number
  }
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
  /** UNIX Timestamp of the last time changes have been made to this product */
  changed: number
  /** Info about the product */
  data: Omit<SanitizedProductType, 'localized'>
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
  /** prices */
  prices: ProductPrice[]
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
  /** timestamp of when this offer expires (in milliseconds) */
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
  localized?: SanitizedLocalizedProductDetails[]
}


// ===== MONGO SCHEMA ===== //

const ProductPriceSchema = new Schema({
  currency: String,
  oldValue: Number,
  newValue: Number,
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
  prices: [ ProductPriceSchema ],
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
    enum: ProductDiscountTypeArray
  },
  urls: ProductUrlsSchema,
  platform: String,
  flags: Number,
  notice: String,
  platformMeta: ProductPlatformMetaSchema,
  staffApproved: Boolean
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
  changed: Number,
  data: ProductDataSchema,
  analytics: ProductAnalyticsSchema
}, { collection: 'products' })


// ===== UTILITY FUNCTIONS ===== //

export function createNewProduct(): ProductDataType {
  return {
    _id: 0,
    analytics: {
      discord: {
        reach: 0
      }
    },
    data: {
      description: '',
      flags: 0,
      id: 0,
      kind: 'other',
      prices: [],
      platform: '',
      staffApproved: false,
      tags: [],
      thumbnails: {
        blank: '',
        full: '',
        org: '',
        tags: ''
      },
      title: '',
      type: 'other',
      until: null,
      urls: {
        browser: '',
        default: '',
        org: ''
      },
      platformMeta: {}
    },
    changed: 0,
    responsible: '',
    status: 'processing',
    uuid: ''
  }
}
