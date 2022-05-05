import * as fs from 'fs'
import Logger from './logger'


export default class ContainerVersion {

  private static version: string

  public static getVersion(): string {
    if (ContainerVersion.version)
      return ContainerVersion.version
    const v = ContainerVersion.readVersion()
    ContainerVersion.version = v
    return v
  }

  private static readVersion(): string {
    if (!fs.existsSync('/app/version')) return 'NONE'
    return fs.readFileSync('/app/version').toString()?.substring(0, 7)
  }

  public static printVersion(): void {
    Logger.info(`Running version ${ContainerVersion.getVersion()}`)
  }

}
