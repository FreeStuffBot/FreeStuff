/* eslint-disable spaced-comment */
import { Long } from 'mongodb'
import { Schema, Document as MongooseDocument } from 'mongoose'


// ===== ARRAY CONSTANTS ===== //

export const AnnouncementApprovalStatus = [ 'pending', 'declined', 'published' ] as const
export const AnnouncementApprovalStatusArray = AnnouncementApprovalStatus as readonly string[]
export type AnnouncementApprovalStatusType = typeof AnnouncementApprovalStatus[number]


// ===== HELPER TYPES ===== //


// ===== EXPORT TYPES ===== //

/** A reduced type to use internally */
export type AnnouncementDataType = {
  _id: Long
  /** UNIX Timestamp in seconds - markes the last time the approval status has changed */
  published: number
  /** Current status of the announcement */
  status: AnnouncementApprovalStatusType
  /** User id of the moderator, responsible for checking the info and publishing the announcement */
  responsible: string
  /** UNIX Timestamp in second of the last time changes have been made to this announcement */
  changed: number
  /** the products in this announcement */
  items: number[]
  /** the channel to publish this announcement on */
  channel: string
}

/** The user mongoose object, muteable and saveable */
export type AnnouncementType = AnnouncementDataType & MongooseDocument<any, {}>

/** The sanitized version of the data, gets served out by the api */
export type SanitizedAnnouncementType = {
  id: Long
  published: number
  status: AnnouncementApprovalStatusType
  responsible: string
  changed: number
  items: number[]
  channel: string
}


// ===== MONGO SCHEMA ===== //

export const AnnouncementSchema = new Schema({
  _id: Long,
  published: Number,
  status: {
    type: String,
    enum: AnnouncementApprovalStatusArray
  },
  responsible: String,
  changed: Number,
  items: [ Number ],
  channel: String
})
