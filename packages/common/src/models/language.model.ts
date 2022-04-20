/* eslint-disable spaced-comment */
import { Schema, Document as MongooseDocument } from 'mongoose'


// ===== ARRAY CONSTANTS ===== //


// ===== HELPER TYPES ===== //


// ===== EXPORT TYPES ===== //

/** A reduced type to use internally */
export type LanguageDataType = {
  _id: string
  _index: number
  _enabled: boolean
  _meta_progress: number
  _meta_last_edit: number
  _meta_last_editor: string

  // speical records that are referenced in code
  lang_name_en: string
} | Record<string, string>

/** The user mongoose object, muteable and saveable */
export type LanguageType = LanguageDataType & MongooseDocument<any, {}>

/** The sanitized version of the data, gets served out by the api */
export type SanitizedLanguageType = Record<string, string>


// ===== MONGO SCHEMA ===== //

export const LanguageSchema = new Schema({
  _id: String,
  _index: Number,
  _enabled: Boolean,
  _meta_progress: Number,
  _meta_last_edit: Number,
  _meta_last_editor: String,

  lang_name_en: String,

  _keys: {
    type: Map,
    of: Schema.Types.Mixed
  }
}, { collection: 'language' })
