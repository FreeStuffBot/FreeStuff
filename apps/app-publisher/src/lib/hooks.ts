import HooksV1 from "./hooks-v1"


type HookInstance = typeof HooksV1

export default class Hooks {

  public static forVersion(version: number): HookInstance {
    switch (version) {
      case 0:
      case 1:
        return HooksV1

      // case 2:
      //   return HooksV2
      
      default:
        return HooksV1
    }
  }

}
