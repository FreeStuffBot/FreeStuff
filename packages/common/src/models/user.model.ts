/* eslint-disable spaced-comment */
import { Schema, Document as MongooseDocument } from 'mongoose'


// ===== ARRAY CONSTANTS ===== //


// ===== HELPER TYPES ===== //

type UserLogin = {
  t: number
  i: string
  la: number
  lo: number
}

type UserDetails = {
  id: string
  username: string
  discriminator: string
  flags: number
  banner: string | null
  banner_color: string
  accent_color: number
  locale: string
  mfa_enabled: boolean
  email: string
  verified: boolean
  _accessToken: string
}


// ===== EXPORT TYPES ===== //

/** A reduced type to use internally */
export type UserDataType = {
  _id: string
  display: string
  scope: string[]
  avatar: string
  logins: UserLogin[]
  data: UserDetails
}

/** The user mongoose object, muteable and saveable */
export type UserType = UserDataType & MongooseDocument<any, {}>

/** The sanitized version of the data, gets served out by the api */
export type SanitizedUserType = {
  id: string
  display: string
  scope: string[]
  avatar: string
}


// ===== MONGO SCHEMA ===== //

export const UserLoginSchema = new Schema({
  t: Number,
  i: String,
  la: Number,
  lo: Number
})

export const UserDetailsSchema = new Schema({
  id: String,
  username: String,
  discriminator: String,
  flags: Number,
  banner: String,
  banner_color: String,
  accent_color: Number,
  locale: String,
  mfa_enabled: Boolean,
  email: String,
  verified: Boolean,
  _accessToken: String
})

export const UserSchema = new Schema({
  _id: String,
  display: String,
  scope: [ String ],
  avatar: String,
  logins: [ UserLoginSchema ],
  data: UserDetailsSchema
}, { collection: 'users' })
