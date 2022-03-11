import * as redis from 'redis'
import { StringValue } from 'ms'


export type configjs = {
  port: number
  mongoUrl: string
  firebase: {
    key: string
    serviceAccount: string
  }
  metrics: {
    recordName: string
    scrapeInterval: StringValue
  }
}
