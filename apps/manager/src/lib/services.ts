import axios from "axios"


export type Service = {
  /** some unique identifier */
  id: string
  /** the ipv4 address of this service */
  addr: string
  /** it's role in the cluster. E.g. discord-interactions, api, thumbnailer, ... */
  role: string
}


export class Services {

  private static list: Map<string, Service> = new Map()

  public static addService(service: Service): void {
    if (Services.list.has(service.id))
      Services.list.set(service.id, service)
  }

  public static getService(id: string): Service {
    return Services.list.get(id)
  }

  public static getServices(): Iterator<Service> {
    return Services.list.values()
  }

  //

  public static async returnHandshake(service: Service, token: string): Promise<boolean> {
    const res = await axios.post('/umi/handshake', token, {
      baseURL: service.addr,
      validateStatus: null,
      timeout: 10000
    })
    return res?.status === 200
  }

}
