import { ExperimentDataType, SanitizedExperimentType } from "../models/experiment.model"


export class ExperimentSanitizer {

  public static sanitize(data: ExperimentDataType): SanitizedExperimentType {
    if (!data) return null
    return {
      id: data._id,
      description: data.description,
      rules: data.rules
    }
  }

}
