import * as redis from 'redis'
import { StringValue } from 'ms'
import { DockerOptions } from 'dockerode'


export type configjs = {
  port: number
  mongoUrl: string
  network: {
    umiAllowedIpRange: string
  }
  dockerOptions: DockerOptions
  dockerManagerServiceName: string
  dockerLabels: {
    role: string
  }
}
