// import * as Docker from 'dockerode'
// import { config } from '..'


// export type FsContainer = {
//   id: string
//   role: string
//   imageName: string
//   imageId: string
//   labels: Record<string, string>
//   state: string
//   networkName: string
//   networkIp: string
// }

// export default class DockerInterface {

//   private static client: Docker

//   public static connect() {
//     DockerInterface.client = new Docker(config.dockerOptions)
//     console.log(JSON.stringify(DockerInterface.getFsContainers(), null, 2)) // TODO REMOVE
//   }

//   public static async getFsContainers() {
//     const list = await DockerInterface.client.listContainers()
//     const freestuffContainers = list.filter(item => item.Labels[config.dockerLabels.role])
//     const out: FsContainer[] = []

//     for (const container of freestuffContainers) {
//       const networkName = container.Labels[config.dockerLabels.network]
//       const network = container.NetworkSettings.Networks[networkName]
//       if (!network) continue // TODO

//       out.push({
//         id: container.Id,
//         role: container.Labels[config.dockerLabels.role],
//         imageName: container.Image,
//         imageId: container.ImageID,
//         labels: container.Labels,
//         state: container.State,
//         networkName,
//         networkIp: network.IPAddress
//       })
//     }
//   }


//   // xyz.freestuffbot.network.role="..."
//   // manager
//   // link-proxy
//   // api

// }
