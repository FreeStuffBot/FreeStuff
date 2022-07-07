/* eslint-disable camelcase */

import Axios from 'axios'


export type LookupResponse = {
  error: true | undefined,
  ip: string,
  version: string,
  city: string,
  region: string,
  region_code: string,
  country: string,
  country_name: string,
  country_code: string,
  country_code_iso3: string,
  country_capital: string,
  country_tld: string,
  continent_code: string,
  in_eu: boolean,
  postal: string,
  latitude: number,
  longitude: number,
  timezone: string,
  utc_offset: string,
  country_calling_code: string,
  currency: string,
  currency_name: string,
  languages: string,
  country_area: number,
  country_population: number,
  asn: string,
  org: string
}

export default class IPApi {

  public static async lookup(ip: string): Promise<LookupResponse | null> {
    try {
      const { data } = await Axios.get(`https://ipapi.co/${ip}/json/`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36'
        }
      })
      return data as LookupResponse
    } catch (ex) {
      return null
    }
  }

}
