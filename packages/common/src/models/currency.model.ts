/* eslint-disable spaced-comment */
import { Schema, Document as MongooseDocument } from 'mongoose'


// ===== ARRAY CONSTANTS ===== //


// ===== HELPER TYPES ===== //


// ===== EXPORT TYPES ===== //

/** A reduced type to use internally */
export type CurrencyDataType = {
  _id: string // eur
  name: string // Euro
  symbol: string // €
}

/** The user mongoose object, muteable and saveable */
export type CurrencyType = CurrencyDataType & MongooseDocument<any, {}>

/** The sanitized version of the data, gets served out by the api */
export type SanitizedCurrencyType = {
  id: string
  name: string
  symbol: string
}


// ===== MONGO SCHEMA ===== //

export const CurrencySchema = new Schema({
  _id: String,
  name: String,
  symbol: String,
}, { collection: 'currencies' })
