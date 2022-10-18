/* eslint-disable spaced-comment */
import { Schema, Document as MongooseDocument } from 'mongoose'


// ===== ARRAY CONSTANTS ===== //


// ===== HELPER TYPES ===== //


// ===== EXPORT TYPES ===== //

/** A reduced type to use internally */
export type TranslateApplicationDataType = {
  _id: string,
  submitted: number,
  language: string,
  userSince: string,
  whyThem: string,
  whereFrom: string,
  declined: null | string
}

/** The user mongoose object, muteable and saveable */
export type TranslateApplicationType = TranslateApplicationDataType & MongooseDocument<any, {}>

/** The sanitized version of the data, gets served out by the api */
export type SanitizedTranslateApplicationType = {
  id: string,
  submitted: number,
  language: string,
  userSince: string,
  whyThem: string,
  whereFrom: string,
  declined: null | string
}


// ===== MONGO SCHEMA ===== //

export const TranslateApplicationSchema = new Schema({
  _id: String,
  submitted: Number,
  language: String,
  userSince: String,
  whyThem: String,
  whereFrom: String,
  declined: String,
}, { collection: 'translate-applications' })
