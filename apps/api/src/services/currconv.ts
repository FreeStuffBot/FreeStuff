import axios from "axios"
import { config } from ".."

const currencies = [
  'GBP',
  'BRL',
  'BGN',
  'PLN',
  'HUF',
  'BTC'
] as const

export type currency = typeof currencies[number]

export default class CurrConv {

  private static priceMap: Map<currency, number> = new Map()

  public static async updateData() {
    currencies.forEach(name => CurrConv.updateSingle(name))
  }

  private static async updateSingle(name: currency) {
    try {
      const url = `https://free.currconv.com/api/v7/convert?q=USD_${name}&compact=ultra&apiKey=${config.thirdparty.currconv.key}`
  
      const { data, status } = await axios.get(url)
      if (!data || status !== 200) return
  
      const value = data['USD_' + name]
      if (!value) return
      if (typeof value !== 'number') return
  
      this.priceMap.set(name, value)
    } catch (ex) {
    }
  }

  //

  public static convert(usd: number, to: currency) {
    if (!this.priceMap.has(to)) return undefined
    if (this.priceMap.get(to) < 0.01) return this.priceMap.get(to) * usd
    return ~~(this.priceMap.get(to) * usd * 100) / 100
  }

}
