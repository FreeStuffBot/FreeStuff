import { ExperimentDataType, SanitizedExperimentType } from "../models/experiment.model"


type ParsedData = {
  amount: number,
  group: string,
  filter: string[]
}

export class ExperimentSanitizer {

  public static sanitize(data: ExperimentDataType): SanitizedExperimentType {
    if (!data) return null
    return {
      id: data._id,
      description: data.description,
      rules: data.rules,
      ...ExperimentSanitizer.parseExperimentRule(data)
    }
  }

  private static parseExperimentRule(experiment: ExperimentDataType): ParsedData {
    let command = 'amount'
    const out: ParsedData = {
      amount: 0,
      group: '',
      filter: []
    }

    for (const arg of experiment.rules.split(' ')) {
      if (!command) {
        command = arg
        continue
      }

      switch (command) {
        case 'amount':
          out.amount = parseInt(arg.substring(0, arg.length - 1)) / 100
          break

        case 'of':
          out.group = arg
          break

        case 'where':
          out.filter.push(arg)
          break
      }

      command = ''
    }

    return out
  }

}
