import * as os from "os"
import axios, { AxiosResponse } from "axios"
import { PublishReportEventType } from "../types/other/reporting"


export default class ApiInterface {

  private static baseUrl: string
  private static key: string

  public static storeCredentials(baseUrl: string, key: string) {
    this.baseUrl = baseUrl
    this.key = key
  }

  //

  public static makeRequest(method: 'GET' | 'POST' | 'PATCH' | 'DELETE', version: 'v2' | 'internal', endpoint: string, data?: any): Promise<AxiosResponse> {
    try {
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
      }).catch(ex => ({
        status: 999,
        statusText: ex?.message ?? `${ex}`
      } as AxiosResponse))
    } catch (ex) {
      return Promise.resolve({
        status: 999,
        statusText: ex?.message ?? `${ex}`
      } as AxiosResponse)
    }
  }

  //

  public static async loadData<T>(set: 'languages' | 'cms-constants' | 'remote-config' | 'experiments'): Promise<T> {
    const res = await ApiInterface.makeRequest('GET', 'internal', `/data/${set}`)

    if (res.status !== 200)
      return null

    return res.data
  }

  public static async reportPublishingProgress(service: 'discord', announcement: number, event: PublishReportEventType, bucket: number, maxRetries = 3): Promise<void> {
    if (maxRetries < 0) return

    const res = await ApiInterface.makeRequest(
      'POST',
      'internal',
      `/reporting/publishing-progress/${announcement}`,
      { service, bucket, event }
    )

    if (res.status !== 200) {
      await new Promise(res => setTimeout(res, 2000))
      ApiInterface.reportPublishingProgress(service, announcement, event, bucket, maxRetries--)
    }
  }

}
