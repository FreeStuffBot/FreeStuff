import { Logger } from '@freestuffbot/common'
import { GuildData } from '@freestuffbot/typings'


export type Experiment = {
  _id: string
  amount: number
  group: string
}

export default class Experiments {

  private static experiments = {}

  public static updateExperiments(data?: Experiment[]) {
    Logger.info('Experiments updated')

    const newExperiments = {}
    data.forEach(e => (newExperiments[e._id] = e))
    this.experiments = newExperiments
  }

  public static getRawData() {
    return this.experiments
  }

  public static runExperimentOnServer(experimentName: string, guildData: GuildData): boolean {
    if (!guildData) return false
    if (!(experimentName in this.experiments)) return false

    const experiment = this.experiments[experimentName]
    const chance = Math.sin(typeof guildData.sharder === 'number'
      ? guildData.sharder
      : guildData.sharder.getLowBits()) / 2 + 0.5
    if (chance > experiment.amount) return false

    if (!experiment.group) return true
    switch (experiment.group) {
      case 'all': return true
      case 'beta': return guildData.beta
    }
    return false
  }

}