

export default class Utils {

  public static sleep(ms: number): Promise<void> {
    return new Promise(res => setTimeout(res, ms))
  }

  public static isStringTruthy(string: string): boolean {
    if (!string) return false
    if (string === '0') return false
    if (string === 'false') return false
    if (string === 'no') return false
    if (string === 'off') return false

    return true
  }

}
