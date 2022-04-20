import axios, { AxiosResponse } from "axios"
import * as os from "os"


export default class ApiInterface {

  private static baseUrl: string
  private static key: string

  public static storeCredentials(baseUrl: string, key: string) {
    this.baseUrl = baseUrl
    this.key = key
  }

  //

  public static makeRequest(method: 'GET' | 'POST' | 'PATCH' | 'DELETE', version: 'v2' | 'internal', endpoint: string, data?: any): Promise<AxiosResponse> {
    return axios({
      method,
      baseURL: `${ApiInterface.baseUrl}/${version}`,
      url: endpoint,
      headers: {
        Authorization: `Partner ${ApiInterface.key} ${os.hostname()}`,
        Accept: 'application/json'
      },
      data,
      validateStatus: null
    })
  }

  //

  public static async loadData<T>(set: 'languages' | 'cms-constants'): Promise<T> {
    const res = await ApiInterface.makeRequest('GET', 'internal', `/data/${set}`)

    if (res.status !== 200)
      return null

    return res.data
  }

}
