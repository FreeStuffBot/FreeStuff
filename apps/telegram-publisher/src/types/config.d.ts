interface ChannelEntry {
  chatId: string | number,
  locale: string,
}

export type configjs = {
  port: number
  rabbitUrl: string
  network: {
    umiAllowedIpRange: string
  }
  freestuffApi: {
    baseUrl: string
    auth: string
  }
  telegram: {
    botToken: string
    channels: ChannelEntry[]
  }
}
