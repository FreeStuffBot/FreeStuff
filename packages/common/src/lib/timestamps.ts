
export default class Timestamps {

  public static now(): number {
    return ~~(Date.now() / 1000)
  }

  public static parse(timestamp: number): Date {
    return new Date(timestamp * 1000)
  }

}
