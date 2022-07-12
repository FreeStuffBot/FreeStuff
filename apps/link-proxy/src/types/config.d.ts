import { StringValue } from 'ms'


export type configjs = {
  port: number
  mongoUrl: string
  firebase: {
    key: string
    serviceAccount: string
  }
  network: {
    umiAllowedIpRange: string
  }
  metrics: {
    recordName: string
    scrapeInterval: StringValue
  }
}
