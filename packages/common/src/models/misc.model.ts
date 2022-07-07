/* eslint-disable spaced-comment */
import { Schema, Document as MongooseDocument } from 'mongoose'


// ===== ARRAY CONSTANTS ===== //


// ===== HELPER TYPES ===== //


// ===== EXPORT TYPES ===== //

/** A reduced type to use internally */
export type MiscDataType = {
  _id: string // config.global
  data: Object | Array<any> // ...
}

/** The user mongoose object, muteable and saveable */
export type MiscType = MiscDataType & MongooseDocument<any, {}>

/** The sanitized version of the data, gets served out by the api */
export type SanitizedMiscType = {
  id: string
  data: Object | Array<any>
}


// ===== MONGO SCHEMA ===== //

export const MiscSchema = new Schema({
  _id: String,
  data: Object,
}, { collection: 'misc' })
