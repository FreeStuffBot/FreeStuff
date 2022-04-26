import { ProductDataType } from "@freestuffbot/common"
import axios from "axios"
import { config } from ".."


export default class LinkProxy {

  public static async createGameLink(product: ProductDataType): Promise<string> {
    const { data, status } = await axios
      .post('/create-game', product, {
        validateStatus: null,
        baseURL: config.network.linkProxy
      })
      .catch(() => ({
        data: null,
        status: 999
      }))

    if (status !== 200)
      return null

    return data.link
  }

}
