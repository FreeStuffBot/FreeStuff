/* eslint-disable spaced-comment */
import { Schema, Document as MongooseDocument } from 'mongoose'


// ===== ARRAY CONSTANTS ===== //

// export const Events = [ 'uploads_cleanup', 'project_update', 'project_create', 'user_create', 'user_update', 'outgoing_notifications' ] as const
// export const EventsArray = Events as readonly string[]
// export type EventsType = typeof Events[number]


// ===== HELPER TYPES ===== //

type PlatformAssets = {
  icon: string
}


// ===== EXPORT TYPES ===== //

/** A reduced type to use internally */
export type PlatformDataType = {
  _id: string // epic
  name: string // Epic Games Store
  url: string // https://epicgames.com
  description: string // ?
  assets: PlatformAssets
}

/** The user mongoose object, muteable and saveable */
export type PlatformType = PlatformDataType & MongooseDocument<any, {}>

/** The sanitized version of the data, gets served out by the api */
export type SanitizedPlatformType = {
  id: string
  name: string
  url: string
  description: string
  assets: PlatformAssets
}


// ===== MONGO SCHEMA ===== //

export const PlatformSchema = new Schema({
  _id: String,
  name: String,
  url: String,
  description: String,
  assets: {
    icon: String
  }
})
