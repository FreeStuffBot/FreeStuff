import { Logger, UmiInfoReport } from '@freestuffbot/common'
import * as Docker from 'dockerode'
import axios from 'axios'
import { config } from '..'


export type FsContainer = {
  id: string
  role: string
  imageName: string
  labels: Record<string, string>
  networkIp: string
  info: UmiInfoReport
}

export default class DockerInterface {

  private static client: Docker
  private static cache: FsContainer[] = []
  private static cacheRefetchInterval: NodeJS.Timer = null

  public static connect() {
    if (config.dockerOfflineMode) return
    DockerInterface.client = new Docker(config.dockerOptions)

    if (DockerInterface.cacheRefetchInterval)
      clearTimeout(DockerInterface.cacheRefetchInterval)

    DockerInterface.cacheRefetchInterval = setInterval(
      () => DockerInterface.fetchFsContainers(),
      config.behavior.networkRefetchInterval
    )
  }

  public static getFsContainers(): FsContainer[] {
    return [...this.cache]
  }

  public static async fetchFsContainers(): Promise<FsContainer[]> {
    if (config.dockerOfflineMode)
      return DockerInterface.getFsContainersTestData()

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

    const progress = containers.map(async container => {
      const res = await axios
        .get(`http://${container.networkIp}/umi/info`, {
          validateStatus: null,
          timeout: 3000
        })
        .catch(() => null)

      container.info = (res?.status === 200)
        ? res.data
        : null
    })
    await Promise.all(progress)

    DockerInterface.cache = [...containers]
    DockerInterface.onServiceUpdate(containers)
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
      networkIp,
      info: null
    }
  }

  //

  /**
   * Use this method for alerting or external widgets. Gets called once every x seconds
   */
  private static onServiceUpdate(network: FsContainer[]): void {
    // TODO(low) alerting
  }

  //

  private static getFsContainersTestData(): FsContainer[] {
    return [
      {
        "id": "fd895233b73e2f08e2eeb36ff2e30e8262d0d4fb9e5d8cc7047a47bb25159c2f",
        "role": "api",
        "imageName": "ghcr.io/freestuffbot/fsb-api:master",
        "labels": {
          "xyz.freestuffbot.service.role": "api"
        },
        "networkIp": "172.20.0.3",
        "info": null
      },
      {
        "id": "08ff2454815cbd30d695d76363f963bf387f55a3b695a1334eabc85f85a541d3",
        "role": "discord-interactions",
        "imageName": "ghcr.io/freestuffbot/fsb-discord-interactions:master",
        "labels": {
          "xyz.freestuffbot.service.role": "discord-interactions"
        },
        "networkIp": "172.20.0.1",
        "info": null
      }
    ]
  }
}
