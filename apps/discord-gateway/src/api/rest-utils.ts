

export default class RestUtils {

  public static getAPIOffset(serverDate: string | number): number {
    return new Date(serverDate).getTime() - Date.now();
  }

  public static calculateReset(reset: string | number, resetAfter: string | number, serverDate: string | number): number {
    if (resetAfter)
      return Date.now() + Number(resetAfter) * 1_000

    return new Date(Number(reset) * 1_000).getTime() - RestUtils.getAPIOffset(serverDate)
  }

}
