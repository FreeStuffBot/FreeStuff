import axios from 'axios'
import { Express, Request, Response, NextFunction, json } from 'express'
import * as ip from 'ip'
import * as os from 'os'
import ApiInterface from './api-interface'
import CMS from './cms'
import ContainerInfo from './container-info'
import FSApiGateway from './fsapi-gateway'
import Logger from './logger'


export type UmiInfoReport = {
  name: string
  version: string
  id: string
  status: 'ok'
  features: {
    metrics: boolean
    command: boolean
  },
  commands: string[]
}

type ServerMountConfig = {
  allowedIpRange?: string
  renderMetrics?(req: Request, res: Response): any
  /** how often to refetch certain data when not asked to */
  fetch?: {
    cmsConstants?: number
    languages?: number
    experiments?: number
    remoteConfig?: number
  }
}

export default class UmiLibs {

  private static commandHandlers: Record<string, (data: any) => string> = {
    shutdown(): string {
      process.exit(0)
    },
    refetch(entries: string[]): string {
      if (entries.includes('config'))
        CMS.loadRemoteConfig()
      if (entries.includes('experiments'))
        CMS.loadExperiments()
      if (entries.includes('cms.languages'))
        CMS.loadLanguages()
      if (entries.includes('cms.constants'))
        CMS.loadConstants()
      
      for (const entry of entries) {
        if (!entry.startsWith('api')) continue
        const [ _major, minor, id ] = entry.split('.')
        if (!minor || !id) continue

        if (minor === 'product')
          // if (id === '*') clearProductCache... else
          // FSApiGateway.updateProduct(id as any)
          void 0 // TODO(lowest)
        
        if (minor === 'channel')
          FSApiGateway.updateChannel(id as any)
          
        if (minor === 'announcement')
          // if (id === '*') clearAnnouncementCache... else
          // FSApiGateway.updateAnnouncement(id as any)
          void 0 // TODO(lowest)
      }

      return ''
    },
    log(text: string): string {
      Logger.debug(`UMI: ${text}`)
      return ''
    }
  }

  private static serviceName = 'unknown'
  private static features: UmiInfoReport['features'] = {
    command: true,
    metrics: false
  }

  //

  public static registerCommand(name: string, handler: (data: any) => string) {
    UmiLibs.commandHandlers[name] = handler
  }

  public static mount(server: Express, config: ServerMountConfig): void {
    UmiLibs.serviceName = UmiLibs.getServiceName()

    if (config.allowedIpRange) {
      server.all('/umi/*', UmiLibs.ipLockMiddleware(config.allowedIpRange))
    }

    if (config.renderMetrics) {
      server.get('/umi/metrics', config.renderMetrics)
      UmiLibs.features.metrics = true
    }

    server.get('/umi/info', UmiLibs.renderInfoResponse)

    server.post('/umi/command', json(), UmiLibs.handleCommand)

    UmiLibs.initFetching(config.fetch)
  }

  //

  public static ipLockMiddleware(range: string) {
    const subnet = range ? ip.cidrSubnet(range) : null
    return (req: Request, res: Response, next: NextFunction) => {
      const reqIp = req.ip.replace('::ffff:', '').split('/')[0]
      if (!range || subnet.contains(reqIp)) return next()

      res.status(407).send(`Not allowed. Your IP address does not have access to this resource.\n${req.ip}`)
    }
  }

  public static renderInfoResponse(req: Request, res: Response): void {
    const out: UmiInfoReport = {
      name: UmiLibs.serviceName,
      version: ContainerInfo.getVersion(),
      id: os.hostname(),
      status: 'ok',
      features: UmiLibs.features,
      commands: Object.keys(UmiLibs.commandHandlers)
    }

    res.status(200).json(out)
  }

  public static handleCommand(req: Request, res: Response) {
    if (!req.body || !req.body.name)
      return res.status(400).send({ success: false, error: 'missing command' })

    const name = req.body.command
    const data = req.body.data ?? {}

    Logger.process(`Received UMI command ${name}`)

    const handler = UmiLibs.commandHandlers[name]
    if (!handler)
      return res.status(400).json({ success: false, error: `No handler for command "${name}"` })

    const error = handler(data)
    if (error) return res.status(400).json({ success: false, error })
    else return res.status(200).json({ success: true })
  }

  public static initFetching(config: ServerMountConfig['fetch']) {
    if (!config) return

    if (config.cmsConstants) {
      UmiLibs.loadCertain(CMS.loadConstants, true, () => {
        Logger.error(`Failed loading CMS Constants, shutdown.`)
        process.exit(1)
      }).then(() => Logger.process('Loaded CMS Constants.'))
      setInterval(() => CMS.loadConstants(), config.cmsConstants)
    }

    if (config.languages) {
      UmiLibs.loadCertain(CMS.loadLanguages, true, () => {
        Logger.error(`Failed loading Languages, shutdown.`)
        process.exit(1)
      }).then(() => Logger.process('Loaded Languages.'))
      setInterval(() => CMS.loadLanguages(), config.languages)
    }

    if (config.remoteConfig) {
      UmiLibs.loadCertain(CMS.loadRemoteConfig, true, () => {
        Logger.error(`Failed loading Remote Config, shutdown.`)
        process.exit(1)
      }).then(() => Logger.process('Loaded Remote Config.'))
      setInterval(() => CMS.loadRemoteConfig(), config.remoteConfig)
    }

    if (config.experiments) {
      UmiLibs.loadCertain(CMS.loadExperiments, true, () => {
        Logger.error(`Failed loading Experiments, shutdown.`)
        process.exit(1)
      }).then(() => Logger.process('Loaded Experiments.'))
      setInterval(() => CMS.loadExperiments(), config.experiments)
    }
  }

  //

  private static getServiceName(): string {
    const name = process.env.npm_package_name
    if (!name) return 'UNKNOWN'
    if (name.startsWith('@')) return name.split('/')[1]
    return name
  }

  private static async loadCertain(loader: () => Promise<boolean>, requireSuccess: boolean, onFail: () => any) {
    const success = await loader()
    if (success || !requireSuccess) return
    let delay = 1000
    while (delay <= 1000 * 60 * 2) {
      await new Promise(res => setTimeout(res, delay))
      if (await loader()) return
      delay *= 2
    }
    onFail()
  }

}
