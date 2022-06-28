import { Logger } from '@freestuffbot/common'
import * as Docker from 'dockerode'
import axios from 'axios'
import { config } from '..'


export type FsContainer = {
  id: string
  role: string
  imageName: string
  labels: Record<string, string>
  networkIp: string
}

export default class DockerInterface {

  private static client: Docker

  public static connect() {
    if (config.dockerOfflineMode) return
    DockerInterface.client = new Docker(config.dockerOptions)

    setInterval(async () => {
      Logger.debug('debug start')
      const a = await DockerInterface.getFsContainers()
      const b = a[~~(Math.random() * a.length)]
      Logger.debug(`Testing ${b.role} (${b.networkIp})`)
      const { status: s1 } = await axios.get(`http://${b.networkIp}/`, { validateStatus: null }).catch(() => ({ status: -1 }))
      Logger.debug('GET / -> ' + s1)
      const { status: s2 } = await axios.get(`http://${b.networkIp}/umi/info`, { validateStatus: null }).catch(() => ({ status: -1 }))
      Logger.debug('GET /umi/info -> ' + s2)
      const { status: s3 } = await axios.get(`http://${b.networkIp}:80/umi/info`, { validateStatus: null }).catch(() => ({ status: -1 }))
      Logger.debug('GET 80 /umi/info -> ' + s3)
      Logger.debug('debug end')
    }, 10000)
  }

  public static async getFsContainers() {
    if (config.dockerOfflineMode)
      return this.getFsContainersTestData()

    const self = await DockerInterface.client.listServices({
      Filters: {
        name: [ config.dockerManagerServiceName ]
      }
    })

    if (!self?.length) {
      Logger.error('Error at DockerInterface::getFsContainers() -> "self was not found"')
      return
    }

    const validNetworks = self[0].Endpoint.VirtualIPs.map(i => i.NetworkID)

    const services = await DockerInterface.client.listServices({
      Filters: {
        label: [ config.dockerLabels.role ]
      }
    })

    if (!services?.length) {
      Logger.error('Error at DockerInterface::getFsContainers() -> "no services were found"')
      return
    }

    const containers = services
      .map(s => DockerInterface.mapServiceToFsContainer(s, validNetworks))
      .filter(s => (!!s.networkIp && !!s.role))

    return containers
  }

  private static mapServiceToFsContainer(service: Docker.Service, validNetworks: string[]): FsContainer {
    let networkIp = null

    for (const network of service.Endpoint.VirtualIPs) {
      if (!validNetworks.includes(network.NetworkID)) continue
      networkIp = network.Addr?.split('/')[0] ?? null
      if (networkIp) break
    }

    return {
      id: service.ID,
      role: service.Spec.Labels[config.dockerLabels.role],
      imageName: service.Spec.Name,
      labels: service.Spec.Labels,
      networkIp
    }
  }

  //

  private static getFsContainersTestData() {
    return [
      {
        "id": "fd895233b73e2f08e2eeb36ff2e30e8262d0d4fb9e5d8cc7047a47bb25159c2f",
        "role": "api",
        "imageName": "ghcr.io/freestuffbot/fsb-api:master",
        "labels": {
          "xyz.freestuffbot.service.role": "api"
        },
        "networkIp": "172.20.0.3"
      },
      {
        "id": "08ff2454815cbd30d695d76363f963bf387f55a3b695a1334eabc85f85a541d3",
        "role": "discord-interactions",
        "imageName": "ghcr.io/freestuffbot/fsb-discord-interactions:master",
        "labels": {
          "xyz.freestuffbot.service.role": "discord-interactions"
        },
        "networkIp": "172.20.0.2"
      }
    ]
  }
}
