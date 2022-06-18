import * as Docker from 'dockerode'
import { config } from '..'


export type FsContainer = {
  id: string
  role: string
  imageName: string
  imageId: string
  labels: Record<string, string>
  state: string
  networkName: string
  networkIp: string
}

const FSBNetworkName = 'FSBNetworkName'

export default class DockerInterface {

  private static client: Docker

  public static connect() {
    // DockerInterface.client = new Docker(config.dockerOptions)
    // DockerInterface
    //   .getFsContainers()
    //   .then(e => JSON.stringify(e, null, 2))
    //   .then(console.log) // REMOVE
  }

  public static async getFsContainers() {    
    // const networks = await DockerInterface.getNetworks(config.dockerNetworkPrefix)
    // const list = await DockerInterface.extractContainers(networks)
    // console.log('LIST')
    // console.log(list)
    // console.log('LIST MAPPED')

    // // item.Config.Labels['com.docker.swarm.node.id'] // TODO identify node its running on
    // console.log(list.map(i => ({ Labels: i.Config.Labels, network: i.NetworkSettings.Networks })))
    // const freestuffServices = list.filter(item => item.Config.Labels[config.dockerLabels.module])
    // console.log('SERVICES')
    // console.log(freestuffServices)
    // const out: FsContainer[] = []

    // for (const service of freestuffServices) {
    //   const networkName = service[FSBNetworkName]
    //   const network = service.NetworkSettings.Networks[networkName]
    //   console.log('FOUND ' + service.Id + " - " + service.Config?.Image + " + " + networkName + " # " + !!network)
    //   if (!network) continue // TODO

    //   out.push({
    //     id: service.Id,
    //     role: service.Config.Labels[config.dockerLabels.module],
    //     imageName: service.Config.Image,
    //     imageId: service.Image,
    //     labels: service.Config.Labels,
    //     state: service.State.Status,
    //     networkName,
    //     networkIp: network.IPAddress
    //   })
    // }

    // return out
  }

  private static async getNetworks(beginWith: string): Promise<any[]> {
    const raw = await DockerInterface.client.listNetworks()
    const promised = raw
      .filter(n => n.Name.startsWith(beginWith))
      .map(n => DockerInterface.client.getNetwork(n.Id).inspect())
    const details = await Promise.all(promised)
    return details
  }

  private static async extractContainers(networks: any[]): Promise<any[]> {
    const out: Map<string, any> = new Map()

    for (const network of networks) {
      for (const id of Object.keys(network.Containers)) {
        if (out.has(id)) continue
        if (!/^[a-z0-9]{10,}$/.test(id)) continue
        const data = await DockerInterface.client.getContainer(id).inspect()
        ;(data as any)[FSBNetworkName] = network.Name
        out.set(id, data)
      }
    }

    return [...out.values()]
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
