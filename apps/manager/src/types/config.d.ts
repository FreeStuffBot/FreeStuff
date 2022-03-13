import * as redis from 'redis'
import { StringValue } from 'ms'
import { DockerOptions } from 'dockerode'


export type configjs = {
  port: number
  mongoUrl: string
  dockerOptions: DockerOptions
  dockerLabels: {
    role: string
    network: string
  }
}
