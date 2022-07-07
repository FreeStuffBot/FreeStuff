import axios from "axios"


export default class CurrConv {

  private static readonly URL = 'https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/usd.json'

  private static priceMap: Map<string, number> = new Map()

  public static async updateData() {
    const { data, status } = await axios.get(CurrConv.URL, { validateStatus: null }).catch(() => ({} as any))
    if (!data || status !== 200) return

    for (const [ curr, value ] of Object.entries(data.usd)) {
      if (typeof value !== 'number') continue
      CurrConv.priceMap.set(curr, value)
    }
  }

  //

  public static convert(usd: number, to: string) {
    if (!this.priceMap.has(to)) return undefined
    if (this.priceMap.get(to) < 0.01) return this.priceMap.get(to) * usd
    return ~~(this.priceMap.get(to) * usd)
  }

}
