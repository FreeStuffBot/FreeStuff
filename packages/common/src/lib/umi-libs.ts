import { Express, Request, Response, NextFunction } from 'express'
import * as ip from 'ip'
import * as os from 'os'
import CMS from './cms'
import ContainerVersion from './container-version'
import Logger from './logger'


type UmiInfoReport = {
  name: string
  version: string
  id: string
  status: 'ok'
  features: {
    metrics: boolean
    command: boolean
  }
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

  private static serviceName = 'unknown'
  private static features: UmiInfoReport['features'] = {
    command: false,
    metrics: false
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

    UmiLibs.initFetching(config.fetch)
  }

  //

  public static ipLockMiddleware(range: string) {
    const subnet = range ? ip.cidrSubnet(range) : null
    return (req: Request, res: Response, next: NextFunction) => {
      if (!range || subnet.contains(req.ip)) return next()

      res.status(407).send(`Not allowed. Your IP address does not have access to this resource.\n${req.ip}`)
    }
  }

  public static renderInfoResponse(req: Request, res: Response): void {
    const out: UmiInfoReport = {
      name: UmiLibs.serviceName,
      version: ContainerVersion.getVersion(),
      id: os.hostname(),
      status: 'ok',
      features: UmiLibs.features
    }

    res.status(200).json(out)
  }

  public static initFetching(config: ServerMountConfig['fetch']) {
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
