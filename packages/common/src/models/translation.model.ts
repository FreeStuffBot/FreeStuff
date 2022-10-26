/* eslint-disable spaced-comment */
import { Schema, Document as MongooseDocument } from 'mongoose'


// ===== ARRAY CONSTANTS ===== //
export enum TranslationEntryType {
  SUGGESTION = 0,
  COMMENT = 1
}


// ===== HELPER TYPES ===== //


// ===== EXPORT TYPES ===== //

/** A reduced type to use internally */
export type TranslationDataType = {
  /** id follows the following format: `{langCode}:{lineKey}:{userId}` */
  _id: string
  /** parent follows the following format: `{langCode}:{lineKey}` */
  parent: string
  type: TranslationEntryType
  text: string
  createdAt: number
  upvotedBy: string[]
  downvotedBy: string[]
  approved: boolean
}

/** The user mongoose object, muteable and saveable */
export type TranslationType = TranslationDataType & MongooseDocument<any, {}>

/** The sanitized version of the data, gets served out by the api */
export type SanitizedTranslationType = {
  /** id follows the following format: `{langCode}:{lineKey}:{userId}` */
  id: string
  /** parent follows the following format: `{langCode}:{lineKey}` */
  parent: string
  type: TranslationEntryType
  text: string
  createdAt: number
  upvotedBy: string[]
  downvotedBy: string[]
  approved: boolean
}


// ===== MONGO SCHEMA ===== //

export const TranslationSchema = new Schema({
  _id: String,
  parent: String,
  type: Number,
  text: String,
  createdAt: Number,
  upvotedBy: [ String ],
  downvotedBy: [ String ],
  approved: Boolean,
}, { collection: 'translations' })
