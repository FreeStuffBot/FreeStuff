/* eslint-disable spaced-comment */
import { Schema, Document as MongooseDocument } from 'mongoose'


// ===== ARRAY CONSTANTS ===== //


// ===== HELPER TYPES ===== //
export enum NotificationTypeEnum {
  PLAIN = 0
}


// ===== EXPORT TYPES ===== //

/** A reduced type to use internally */
export type NotificationDataType = {
  _id: string
  type: NotificationTypeEnum
  data: any
  recipient: string
  sentAt: number
  readAt: number
  sentBy: string
}

/** The user mongoose object, muteable and saveable */
export type NotificationType = NotificationDataType & MongooseDocument<any, {}>

/** The sanitized version of the data, gets served out by the api */
export type SanitizedNotificationType = {
  id: string
  type: NotificationTypeEnum
  data: any
  recipient: string
  sentAt: number
  readAt: number
  sentBy: string
}


// ===== MONGO SCHEMA ===== //

export const NotificationSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    required: true,
    auto: true,
  },
  type: Number,
  data: Object,
  recipient: String,
  sentAt: Number,
  readAt: Number,
  sentBy: String
}, { collection: 'notifications' })
