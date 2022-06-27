import { Logger } from '@freestuffbot/common'
import * as Docker from 'dockerode'
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
    DockerInterface.client = new Docker(config.dockerOptions)
    DockerInterface
      .getFsContainers()
      .then(e => JSON.stringify(e, null, 2))
      .then(console.log) // REMOVE
  }

  public static async getFsContainers() {
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

    Logger.debug('begin VALID NETWORKS')
    console.log(validNetworks)
    Logger.debug('end VALID NETWORKS')

    const services = await DockerInterface.client.listServices({
      Filters: {
        label: [ config.dockerLabels.role ]
      }
    })
    
    if (!services?.length) {
      Logger.error('Error at DockerInterface::getFsContainers() -> "no services were found"')
      return
    }

    Logger.debug('begin SERVICES')
    console.log(!!services, services?.length)
    Logger.debug('end SERVICES')

    const containers = services
      .map(s => DockerInterface.mapServiceToFsContainer(s, validNetworks))
      .filter(s => !!s.networkIp)


    Logger.debug('begin CONTAINERS')
    console.log(!!containers, containers?.length)
    console.log(containers)
    Logger.debug('end CONTAINERS')

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

  public static async getFsContainersTest() {
    return Promise.resolve([
      {
        "id": "fd895233b73e2f08e2eeb36ff2e30e8262d0d4fb9e5d8cc7047a47bb25159c2f",
        "role": "api",
        "imageName": "ghcr.io/freestuffbot/fsb-api:master",
        "imageId": "sha256:8b7d7f0bed42b11b5c8c65550272b3a903e0510ce60122864411012027a8cb3f",      
        "labels": {
          "com.docker.compose.config-hash": "0bf27970cf3bdd34e68cc3fceadb842c016f8101db423bb2f38c8bdda99b4e42",
          "com.docker.compose.container-number": "1",
          "com.docker.compose.oneoff": "False",
          "com.docker.compose.project": "freestuff",
          "com.docker.compose.project.config_files": "docker-compose.yml",
          "com.docker.compose.project.working_dir": "C:\\Users\\andre\\Desktop\\Projekte\\FreeStuff\\FreeStuff",
          "com.docker.compose.service": "api",
          "com.docker.compose.version": "1.29.2",
          "org.opencontainers.image.created": "2022-05-19T19:24:18.675Z",
          "org.opencontainers.image.description": "Temporary Repo for deployment tests",
          "org.opencontainers.image.licenses": "MPL-2.0",
          "org.opencontainers.image.revision": "76e376bce80010e7625bb9c9b9729ec00197249a",
          "org.opencontainers.image.source": "https://github.com/FreeStuffBot/temp",
          "org.opencontainers.image.title": "temp",
          "org.opencontainers.image.url": "https://github.com/FreeStuffBot/temp",
          "org.opencontainers.image.version": "master",
          "prometheus-job": "fsb",
          "xyz.freestuffbot.service.network": "freestuff_local",
          "xyz.freestuffbot.service.role": "api"
        },
        "state": "running",
        "networkName": "freestuff_local",
        "networkIp": "172.20.0.3"
      },
      {
        "id": "08ff2454815cbd30d695d76363f963bf387f55a3b695a1334eabc85f85a541d3",
        "role": "discord-interactions",
        "imageName": "ghcr.io/freestuffbot/fsb-discord-interactions:master",
        "imageId": "sha256:3e08a5fec37af13f18c69742d4de19e7168431ca0b11c42dce92a7eb7cdff5d1",      
        "labels": {
          "com.docker.compose.config-hash": "3b77bee5b4d578c8aac55b3b10ecf6c640de02167ff84a08ef86906c0b987cf9",
          "com.docker.compose.container-number": "1",
          "com.docker.compose.oneoff": "False",
          "com.docker.compose.project": "freestuff",
          "com.docker.compose.project.config_files": "docker-compose.yml",
          "com.docker.compose.project.working_dir": "C:\\Users\\andre\\Desktop\\Projekte\\FreeStuff\\FreeStuff",
          "com.docker.compose.service": "discord-interactions",
          "com.docker.compose.version": "1.29.2",
          "org.opencontainers.image.created": "2022-05-19T19:24:14.474Z",
          "org.opencontainers.image.description": "Temporary Repo for deployment tests",
          "org.opencontainers.image.licenses": "MPL-2.0",
          "org.opencontainers.image.revision": "76e376bce80010e7625bb9c9b9729ec00197249a",
          "org.opencontainers.image.source": "https://github.com/FreeStuffBot/temp",
          "org.opencontainers.image.title": "temp",
          "org.opencontainers.image.url": "https://github.com/FreeStuffBot/temp",
          "org.opencontainers.image.version": "master",
          "prometheus-job": "fsb",
          "xyz.freestuffbot.service.network": "freestuff_local",
          "xyz.freestuffbot.service.role": "discord-interactions"
        },
        "state": "running",
        "networkName": "freestuff_local",
        "networkIp": "172.20.0.2"
      }
    ])
  }


  // xyz.freestuffbot.network.role="..."
  // manager
  // link-proxy
  // api





  // [
  //   {
  //     "id": "fd895233b73e2f08e2eeb36ff2e30e8262d0d4fb9e5d8cc7047a47bb25159c2f",
  //     "role": "api",
  //     "imageName": "ghcr.io/freestuffbot/fsb-api:master",
  //     "imageId": "sha256:8b7d7f0bed42b11b5c8c65550272b3a903e0510ce60122864411012027a8cb3f",      
  //     "labels": {
  //       "com.docker.compose.config-hash": "0bf27970cf3bdd34e68cc3fceadb842c016f8101db423bb2f38c8bdda99b4e42",
  //       "com.docker.compose.container-number": "1",
  //       "com.docker.compose.oneoff": "False",
  //       "com.docker.compose.project": "freestuff",
  //       "com.docker.compose.project.config_files": "docker-compose.yml",
  //       "com.docker.compose.project.working_dir": "C:\\Users\\andre\\Desktop\\Projekte\\FreeStuff\\FreeStuff",
  //       "com.docker.compose.service": "api",
  //       "com.docker.compose.version": "1.29.2",
  //       "org.opencontainers.image.created": "2022-05-19T19:24:18.675Z",
  //       "org.opencontainers.image.description": "Temporary Repo for deployment tests",
  //       "org.opencontainers.image.licenses": "MPL-2.0",
  //       "org.opencontainers.image.revision": "76e376bce80010e7625bb9c9b9729ec00197249a",
  //       "org.opencontainers.image.source": "https://github.com/FreeStuffBot/temp",
  //       "org.opencontainers.image.title": "temp",
  //       "org.opencontainers.image.url": "https://github.com/FreeStuffBot/temp",
  //       "org.opencontainers.image.version": "master",
  //       "prometheus-job": "fsb",
  //       "xyz.freestuffbot.service.network": "freestuff_local",
  //       "xyz.freestuffbot.service.role": "api"
  //     },
  //     "state": "running",
  //     "networkName": "freestuff_local",
  //     "networkIp": "172.20.0.3"
  //   },
  //   {
  //     "id": "08ff2454815cbd30d695d76363f963bf387f55a3b695a1334eabc85f85a541d3",
  //     "role": "discord-interactions",
  //     "imageName": "ghcr.io/freestuffbot/fsb-discord-interactions:master",
  //     "imageId": "sha256:3e08a5fec37af13f18c69742d4de19e7168431ca0b11c42dce92a7eb7cdff5d1",      
  //     "labels": {
  //       "com.docker.compose.config-hash": "3b77bee5b4d578c8aac55b3b10ecf6c640de02167ff84a08ef86906c0b987cf9",
  //       "com.docker.compose.container-number": "1",
  //       "com.docker.compose.oneoff": "False",
  //       "com.docker.compose.project": "freestuff",
  //       "com.docker.compose.project.config_files": "docker-compose.yml",
  //       "com.docker.compose.project.working_dir": "C:\\Users\\andre\\Desktop\\Projekte\\FreeStuff\\FreeStuff",
  //       "com.docker.compose.service": "discord-interactions",
  //       "com.docker.compose.version": "1.29.2",
  //       "org.opencontainers.image.created": "2022-05-19T19:24:14.474Z",
  //       "org.opencontainers.image.description": "Temporary Repo for deployment tests",
  //       "org.opencontainers.image.licenses": "MPL-2.0",
  //       "org.opencontainers.image.revision": "76e376bce80010e7625bb9c9b9729ec00197249a",
  //       "org.opencontainers.image.source": "https://github.com/FreeStuffBot/temp",
  //       "org.opencontainers.image.title": "temp",
  //       "org.opencontainers.image.url": "https://github.com/FreeStuffBot/temp",
  //       "org.opencontainers.image.version": "master",
  //       "prometheus-job": "fsb",
  //       "xyz.freestuffbot.service.network": "freestuff_local",
  //       "xyz.freestuffbot.service.role": "discord-interactions"
  //     },
  //     "state": "running",
  //     "networkName": "freestuff_local",
  //     "networkIp": "172.20.0.2"
  //   }
  // ]
}
