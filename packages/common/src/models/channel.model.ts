/** @deprecated channels are hard-coded and will not be dynamic */


/* eslint-disable spaced-comment */
import { Schema, Document as MongooseDocument } from 'mongoose'


// ===== ARRAY CONSTANTS ===== //


// ===== HELPER TYPES ===== //


// ===== EXPORT TYPES ===== //

/** A reduced type to use internally */
export type ChannelDataType = {
  _id: string // keep
  name: string // Free to keep
  description: string // Games that are 100% off for a limited amout of time
  premium: boolean // "only available to premium subscribers?"
  default: boolean // "wheather this channel is enabled by default"
}

/** The user mongoose object, muteable and saveable */
export type ChannelType = ChannelDataType & MongooseDocument<any, {}>

/** The sanitized version of the data, gets served out by the api */
export type SanitizedChannelType = {
  id: string
  name: string
  description: string
  premium: boolean
  default: boolean
}


// ===== MONGO SCHEMA ===== //

export const ChannelSchema = new Schema({
  _id: String,
  name: String,
  description: String,
  premium: String,
  default: String,
}, { collection: 'channels' })
