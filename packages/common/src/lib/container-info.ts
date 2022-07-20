import * as fs from 'fs'
import * as os from 'os'
import { Logger } from './logger'


export default class ContainerInfo {

  private static version: string

  public static getVersion(): string {
    if (ContainerInfo.version)
      return ContainerInfo.version
    const v = ContainerInfo.readVersion()
    ContainerInfo.version = v
    return v
  }

  private static readVersion(): string {
    if (!fs.existsSync('/app/version')) return 'NONE'
    return fs.readFileSync('/app/version').toString()?.substring(0, 7)
  }

  public static printVersion(): void {
    Logger.info(`Running version ${ContainerInfo.getVersion()}`)
  }

  //

  public static getId(): string {
    return os.hostname() || 'unknown'
  }

}
