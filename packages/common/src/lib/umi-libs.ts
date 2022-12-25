import * as os from 'os'
import { Express, Request, Response, NextFunction, json } from 'express'
import * as ip from 'ip'
import CMS from './cms'
import ContainerInfo from './container-info'
import FSApiGateway from './fsapi-gateway'
import { Logger } from './logger'
import axios from 'axios'


export type UmiInfoReport = {
  name: string
  version: string
  id: string
  status: 'ok'
  features: {
    metrics: boolean
    command: boolean
  },
  commands: Omit<UmiCommand, 'handler'>[]
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

export type UmiCommandSender = {
  send(receivers: string, command: string, data: any): void
}

type UmiCommandArgumentTypes = 'string' | 'boolean' | 'number'

type UmiCommandArgument<
  Name extends string,
  Type extends UmiCommandArgumentTypes,
  Array extends boolean,
  EnumKeys extends string
> = {
  name: Name,
  type: Type,
  array: Array
  enum: EnumKeys[]
  description: string
  __type?: Record<Name, GetUmiCommandArgumentType<Type, Array, EnumKeys>>
}

type GetUmiCommandArgumentType<
  StringType extends UmiCommandArgumentTypes,
  Array extends boolean,
  EnumKeys extends string
> =
  EnumKeys extends null
  ? (
    StringType extends 'string' ? (Array extends true ? string[] : string)
    : StringType extends 'boolean' ? (Array extends true ? boolean[] : boolean)
    : StringType extends 'number' ? (Array extends true ? number[] : number)
    : never
  )
  : (Array extends true ? string[] : EnumKeys)

type TypedUmiCommand<
  ArgNames extends string,
  ArgTypes extends UmiCommandArgumentTypes,
  ArgArray extends boolean,
  ArgEnumKeys extends string
> = {
  name: string
  description: string
  arguments: UmiCommandArgument<ArgNames, ArgTypes, ArgArray, ArgEnumKeys>[]
  handler: (data: UmiCommandArgument<ArgNames, ArgTypes, ArgArray, ArgEnumKeys>['__type']) => string
}

type UmiCommand = TypedUmiCommand<string, UmiCommandArgumentTypes, boolean, string>

export class UmiLibs {

  private static commandHandlers: UmiCommand[] = []

  private static serviceName = 'unknown'
  private static features: UmiInfoReport['features'] = {
    command: true,
    metrics: false
  }

  //

  public static registerCommand<A extends string, B extends UmiCommandArgumentTypes, C extends boolean, D extends string>(command: TypedUmiCommand<A, B, C, D>) {
    UmiLibs.commandHandlers.push(command)
  }

  public static mount(server: Express, config: ServerMountConfig): void {
    UmiLibs.serviceName = UmiLibs.getServiceName()

    if (config.allowedIpRange) 
      server.all('/umi/*', UmiLibs.ipLockMiddleware(config.allowedIpRange))

    if (config.renderMetrics) {
      server.get('/umi/metrics', config.renderMetrics)
      UmiLibs.features.metrics = true
    }

    UmiLibs.registerDefaultCommands()

    server.get('/umi/info', UmiLibs.renderInfoResponse)

    server.post('/umi/command', json(), UmiLibs.handleCommand)

    UmiLibs.initFetching(config.fetch)
  }

  //

  public static ipLockMiddleware(range: string) {
    const subnet = range ? ip.cidrSubnet(range) : null
    return (req: Request, res: Response, next: NextFunction) => {
      const cfConnect = req.headers['cf-connecting-ip']
      if (cfConnect) {
        const ray = req.headers['cf-ray']
        res.status(407).send(`Not allowed. Your IP address does not have access to this resource.\n${cfConnect}\nCloudflare Ray ID: ${ray}`)
        return
      }

      const reqIp = req.ip.replace('::ffff:', '').split('/')[0]
      if (!range || subnet.contains(reqIp)) return next()

      res.status(407).send(`Not allowed. Your IP address does not have access to this resource.\n${req.ip}`)
    }
  }

  public static renderInfoResponse(_req: Request, res: Response): void {
    const out: UmiInfoReport = {
      name: UmiLibs.serviceName,
      version: ContainerInfo.getVersion(),
      id: os.hostname(),
      status: 'ok',
      features: UmiLibs.features,
      commands: UmiLibs.commandHandlers.map(cmd => ({
        name: cmd.name,
        description: cmd.description,
        arguments: cmd.arguments
      }))
    }

    res.status(200).json(out)
  }

  public static handleCommand(req: Request, res: Response) {
    if (!req.body || !req.body.name)
      return res.status(400).send({ success: false, error: 'missing command' })

    const name = req.body.name
    const data = req.body.data ?? {}

    Logger.process(`Received UMI command ${name}`)

    const cmd = UmiLibs.commandHandlers.find(c => c.name === name)
    if (!cmd)
      return res.status(400).json({ success: false, error: `No handler for command "${name}"` })

    const error = cmd.handler(data)
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

  public static registerCommandSender(recHost: string): UmiCommandSender {
    const send = (receivers: string, command: string, data: any) => {
      const exec = () => axios.post(
        '/services/command',
        { receivers, name: command, data },
        { baseURL: recHost, validateStatus: null }
      ).catch(() => null).then(res => res && res.status === 200)

      UmiLibs.loadCertain(exec, true, () => Logger.warn(`UMI command ${command} could not be delivered.`))
    }
    return { send }
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

  private static registerDefaultCommands() {
    UmiLibs.registerCommand({
      name: 'shutdown',
      description: 'Shuts the service down, resulting in a restart.',
      arguments: [],
      handler(): string {
        process.exit(0)
      }
    })

    UmiLibs.registerCommand({
      name: 'refetch',
      description: 'Re-fetches one or multiple data sources.',
      arguments: [
        {
          name: 'entries',
          type: 'string',
          array: true,
          enum: [
            'config',
            'experiments',
            'cms.languages',
            'cms.constants',
            'api.product.*',
            'api.channel.*',
            'api.announcement.*'
          ],
          description: 'Select which datasets you want to re-fetch'
        }
      ],
      handler({ entries }): string {
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
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const [ _major, minor, id ] = entry.split('.')
          if (!minor || !id) continue
  
          if (minor === 'product')
            FSApiGateway.clearProductsCache(id)
  
          if (minor === 'channel')
            FSApiGateway.updateChannel(id as any, true)
  
          if (minor === 'announcement')
            FSApiGateway.clearAnnouncementsCache(id)
        }
  
        return ''
      }
    })

    UmiLibs.registerCommand({
      name: 'log',
      description: 'Debug logs something to the console',
      arguments: [
        {
          name: 'text',
          description: 'Text to print',
          type: 'string',
          array: false,
          enum: null
        }
      ],
      handler({ text }): string {
        Logger.debug(`UMI: ${text}`)
        return ''
      }
    })
  }

}
