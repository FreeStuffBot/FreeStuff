import { DockerOptions } from 'dockerode'


export type configjs = {
  port: number
  mongoUrl: string
  network: {
    umiAllowedIpRange: string
  }
  dockerOfflineMode: boolean,
  dockerOptions: DockerOptions
  dockerManagerServiceName: string
  dockerLabels: {
    role: string
  }
  behavior: {
    networkRefetchInterval: number
  }
}
