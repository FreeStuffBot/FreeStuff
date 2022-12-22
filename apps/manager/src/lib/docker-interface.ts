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
      clearInterval(DockerInterface.cacheRefetchInterval)

    DockerInterface.cacheRefetchInterval = setInterval(
      () => DockerInterface.fetchFsContainers(),
      config.behavior.networkRefetchInterval
    )
    DockerInterface.fetchFsContainers()
  }

  public static getFsContainers(): FsContainer[] {
    if (config.dockerOfflineMode)
      return DockerInterface.getFsContainersTestData()
    return [ ...this.cache ]
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

    const services = await DockerInterface.client.listServices(<any> {
      filters: { label: [ config.dockerLabels.role ] }
    } as Docker.ServiceListOptions)

    if (!services?.length) {
      Logger.error('Error at DockerInterface::getFsContainers() -> "no services were found"')
      return
    }

    const validServices = services.filter(s => s.Spec?.Name)

    const fetchContainers = validServices.map(async service => {
      const tasks = await DockerInterface.client.listTasks({
        filters: {
          service: [ service.Spec.Name ],
          'desired-state': ['running']
        }
      })
      return tasks
        .map(t => DockerInterface.mapTaskToFsContainer(t, service, validNetworks))
        .filter(s => (!!s.networkIp && !!s.role))
    })

    const containersNested = await Promise.all(fetchContainers)
    const containers = containersNested.flat()

    const progress = containers.map(async (container) => {
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

    DockerInterface.cache = [ ...containers ]
    DockerInterface.onServiceUpdate(containers)
    return containers
  }

  private static mapTaskToFsContainer(task: Docker.Task | any, service: Docker.Service, validNetworks: string[]): FsContainer {
    let networkIp = null

    for (const attachment of task.NetworksAttachments) {
      if (!validNetworks.includes(attachment.Network.ID)) continue
      networkIp = attachment.Addresses[0]?.split('/')[0] ?? null
      if (networkIp) break
    }

    return {
      id: task.ID,
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
  private static onServiceUpdate(_network: FsContainer[]): void {
    // TODO(low) alerting
  }

  //

  private static getFsContainersTestData(): FsContainer[] {
    return JSON.parse('[{"id":"32ogc4h9j9tk7ova0xbzomxwo","role":"discord-interactions","imageName":"fsb_discord_interactions","labels":{"com.docker.stack.image":"ghcr.io/freestuffbot/fsb-discord-interactions:master","com.docker.stack.namespace":"fsb","prometheus-job":"fsb","traefik.docker.network":"proxy","traefik.enable":"true","traefik.http.routers.fsb-discord-interactions.entrypoints":"https","traefik.http.routers.fsb-discord-interactions.rule":"Host(`inbound-discord--net.freestuffbot.xyz`)","traefik.http.routers.fsb-discord-interactions.tls.certresolver":"cloudflare","traefik.http.routers.fsb-discord-interactions.tls.domains[0].main":"inbound-discord--net.freestuffbot.xyz","traefik.http.services.fsb-discord-interactions.loadbalancer.server.port":"80","xyz.freestuffbot.service.role":"discord-interactions"},"networkIp":"10.0.5.16","info":{"name":"discord-interactions","version":"NONE","id":"d563696d22dd","status":"ok","features":{"command":true,"metrics":true},"commands":[{"name":"shutdown","description":"Shuts the service down, resulting in a restart.","arguments":[]},{"name":"refetch","description":"Re-fetches one or multiple data sources.","arguments":[{"name":"entries","type":"string","array":true,"enum":["config","experiments","cms.languages","cms.constants","api.product.*","api.channel.*","api.announcement.*"],"description":"Select which datasets you want to re-fetch"}]},{"name":"log","description":"Debug logs something to the console","arguments":[{"name":"text","description":"Text to print","type":"string","array":false,"enum":null}]},{"name":"test","description":"This is a test command to test.","arguments":[{"name":"text","type":"string","description":"A text","array":false,"enum":null},{"name":"text_list","type":"string","description":"Two text","array":true,"enum":null},{"name":"one_emum","type":"string","description":"Three text","array":false,"enum":["gaming","not gaming"]},{"name":"more_emum","type":"string","description":"Four text","array":true,"enum":["gaming","not gaming","three gaming"]},{"name":"numbr","type":"number","description":"one or two or more","array":false,"enum":null},{"name":"boooool","type":"boolean","description":"tru or fals","array":false,"enum":null}]}]}},{"id":"dnjky68p88sw76fgcw4sjpv53","role":"link-proxy","imageName":"fsb_link_proxy","labels":{"com.docker.stack.image":"ghcr.io/freestuffbot/fsb-link-proxy:master","com.docker.stack.namespace":"fsb","prometheus-job":"fsb","xyz.freestuffbot.service.role":"link-proxy"},"networkIp":"10.0.6.18","info":null},{"id":"hjejaius41cbzt2zhou4u4df0","role":"manager","imageName":"fsb_manager","labels":{"com.docker.stack.image":"ghcr.io/freestuffbot/fsb-manager:master","com.docker.stack.namespace":"fsb","prometheus-job":"fsb","xyz.freestuffbot.service.role":"manager"},"networkIp":"10.0.5.2","info":null},{"id":"j3t8a965fichl2qsfhom0bpg3","role":"discord-publisher","imageName":"fsb_discord_publisher","labels":{"com.docker.stack.image":"ghcr.io/freestuffbot/fsb-discord-publisher:master","com.docker.stack.namespace":"fsb","prometheus-job":"fsb","xyz.freestuffbot.service.role":"discord-publisher"},"networkIp":"10.0.6.5","info":null},{"id":"lwfpbg6vie0z84q44sxhpije4","role":"thumbnailer","imageName":"fsb_thumbnailer","labels":{"com.docker.stack.image":"ghcr.io/freestuffbot/fsb-thumbnailer:master","com.docker.stack.namespace":"fsb","prometheus-job":"fsb","xyz.freestuffbot.service.role":"thumbnailer"},"networkIp":"10.0.6.16","info":null},{"id":"mmsvq4brpr1crpapy5llntt1d","role":"app-publisher","imageName":"fsb_app_publisher","labels":{"com.docker.stack.image":"ghcr.io/freestuffbot/fsb-app-publisher:master","com.docker.stack.namespace":"fsb","prometheus-job":"fsb","xyz.freestuffbot.service.role":"app-publisher"},"networkIp":"10.0.6.14","info":null},{"id":"nxjraem8e1a8ierpou9t6qb1h","role":"api","imageName":"fsb_api","labels":{"com.docker.stack.image":"ghcr.io/freestuffbot/fsb-api:master","com.docker.stack.namespace":"fsb","prometheus-job":"fsb","traefik.docker.network":"proxy","traefik.enable":"true","traefik.http.routers.fsb-api.entrypoints":"https","traefik.http.routers.fsb-api.rule":"Host(`api.freestuffbot.xyz`)","traefik.http.routers.fsb-api.tls.certresolver":"cloudflare","traefik.http.routers.fsb-api.tls.domains[0].main":"api.freestuffbot.xyz","traefik.http.services.fsb-api.loadbalancer.server.port":"80","xyz.freestuffbot.service.role":"api"},"networkIp":"10.0.5.10","info":null},{"id":"tnhu8z8o9vhd90uylsvccy87q","role":"discord-gateway","imageName":"fsb_discord_gateway","labels":{"com.docker.stack.image":"ghcr.io/freestuffbot/fsb-discord-gateway:master","com.docker.stack.namespace":"fsb","prometheus-job":"fsb","xyz.freestuffbot.service.role":"discord-gateway"},"networkIp":"10.0.5.8","info":{"name":"discord-gateway","version":"NONE","id":"92d1ac822c64","status":"ok","features":{"command":true,"metrics":true},"commands":[{"name":"shutdown","description":"Shuts the service down, resulting in a restart.","arguments":[]},{"name":"refetch","description":"Re-fetches one or multiple data sources.","arguments":[{"name":"entries","type":"string","array":true,"enum":["config","experiments","cms.languages","cms.constants","api.product.*","api.channel.*","api.announcement.*"],"description":"Select which datasets you want to re-fetch"}]},{"name":"log","description":"Debug logs something to the console","arguments":[{"name":"text","description":"Text to print","type":"string","array":false,"enum":null}]}]}}]')
  }

}
