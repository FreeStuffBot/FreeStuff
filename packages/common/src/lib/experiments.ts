import { SanitizedExperimentType } from "../models/experiment.model"
import { SanitizedGuildType } from "../models/guild.model"
import { Logger } from "./logger"


export type ExperimentId
= 'announcement_tags'
| 'use_proxy_url'
| 'show_donation_notice'
| 'allow_thread_channels'

export default class Experiments {

  private static experiments: Map<string, SanitizedExperimentType> = new Map()

  public static load(data?: SanitizedExperimentType[]) {
    Experiments.experiments.clear()
    for (const exp of data)
      Experiments.experiments.set(exp.id, exp)

    Logger.info('Experiments updated')
  }

  public static runExperimentOnServer(experimentName: ExperimentId, guildData: SanitizedGuildType): boolean {
    if (!guildData) return false
    if (!Experiments.experiments.has(experimentName)) return false
    
    const experiment = Experiments.experiments.get(experimentName)

    if (!Experiments.passesBucketFilter(experiment, guildData))
      return false

    if (!Experiments.passesGroupFilter(experiment, guildData))
      return false

    return true
  }

  //

  private static passesBucketFilter(experiment: SanitizedExperimentType, guildData: SanitizedGuildType): boolean {
    const bucket = Math.sin(typeof guildData.sharder === 'number'
      ? guildData.sharder
      : (guildData.sharder as any).getLowBits()) / 2 + 0.5
    return bucket <= experiment.amount
  }

  private static passesGroupFilter(experiment: SanitizedExperimentType, guildData: SanitizedGuildType): boolean {
    if (!experiment.group) return true
    switch (experiment.group) {
      case 'all': return true
      case 'beta': return guildData.beta
    }
    return false
  }

}
