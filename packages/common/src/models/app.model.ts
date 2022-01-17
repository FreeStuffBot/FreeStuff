/* eslint-disable spaced-comment */
import { Schema, Document as MongooseDocument } from 'mongoose'


// ===== ARRAY CONSTANTS ===== //


// ===== HELPER TYPES ===== //


// ===== EXPORT TYPES ===== //

/** A reduced type to use internally */
export type AppDataType = {
  _id: string
  type: 'basic' | 'partner'
  description: string
  key: string
  webhookUrl: string
  webhookSecret: string
  lcKey: number
  lcWebhookUrl: number
  lcWebhookVersion: number
}

/** The user mongoose object, muteable and saveable */
export type AppType = AppDataType & MongooseDocument<any, {}>

/** The sanitized version of the data, gets served out by the api */
export type SanitizedAppType = {
  id: string
  type: 'basic' | 'partner'
  description: string
  key: string
  webhookUrl: string
  webhookSecret: string
  lcKey: number
  lcWebhookUrl: number
  lcWebhookVersion: number
}


// ===== MONGO SCHEMA ===== //

export const AppSchema = new Schema({
  _id: String,
  type: String,
  description: String,
  key: String,
  webhookUrl: String,
  webhookSecret: String,
  lcKey: Number,
  lcWebhookUrl: Number,
  lcWebhookVersion: Number
}, { collection: 'apps' })
