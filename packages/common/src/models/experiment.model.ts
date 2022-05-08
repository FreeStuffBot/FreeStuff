/* eslint-disable spaced-comment */
import { Schema, Document as MongooseDocument } from 'mongoose'


// ===== ARRAY CONSTANTS ===== //


// ===== HELPER TYPES ===== //


// ===== EXPORT TYPES ===== //

/** A reduced type to use internally */
export type ExperimentDataType = {
  _id: string // feature_name
  description: string // Does this and that
  rules: string // 20% of beta
}

/** The user mongoose object, muteable and saveable */
export type ExperimentType = ExperimentDataType & MongooseDocument<any, {}>

/** The sanitized version of the data, gets served out by the api */
export type SanitizedExperimentType = {
  id: string
  description: string
  rules: string
  amount: number
  group: string
  filter: string[]
}


// ===== MONGO SCHEMA ===== //

export const ExperimentSchema = new Schema({
  _id: String,
  description: String,
  rules: String,
}, { collection: 'experiments' })
