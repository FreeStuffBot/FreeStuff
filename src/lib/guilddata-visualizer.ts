import { GuildData } from '../types/datastructs'
import Tracker from '../bot/tracker'
import Logger from './logger'


export default function guildDataToViewString(g: GuildData, maxLength?: number, errorMessage?: string) {
  const gd = JSON.parse(JSON.stringify(g))
  if (gd) {
    delete gd.channelInstance
    delete gd.roleInstance
    gd.currency = gd.currency.name
    gd.price = gd.price.name
    gd.theme = gd.theme.name
    gd.platformsList = gd.platformsList.map(p => p.id)
    gd.trackerList = Object
      .entries(Tracker.TRACKING_POINT)
      .filter(v => (gd.tracker & v[1]) !== 0)
      .map(v => v[0])
  }

  let guilddata = `\`\`\`json\n${JSON.stringify(gd || { error: 'Guild Data Error' }, null, 2)}\`\`\``
  if (guilddata.length > (maxLength | 2048)) guilddata = `\`\`\`json\n${JSON.stringify(gd || { error: 'Guild Data Error' }, null, 1)}\`\`\``
  if (guilddata.length > (maxLength | 2048)) guilddata = `\`\`\`json\n${JSON.stringify(gd || { error: 'Guild Data Error' })}\`\`\``
  if (guilddata.length > (maxLength | 2048)) {
    Logger.log(JSON.stringify(gd, null, 2))
    guilddata = errorMessage || 'Guild data too long. Check logs.'
  }

  return guilddata
}
