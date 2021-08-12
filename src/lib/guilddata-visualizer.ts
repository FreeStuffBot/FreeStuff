import { hostname } from 'os'
import { GuildData } from '../types/datastructs'
import Tracker from '../bot/tracker'
import Manager from '../controller/manager'
import { Core } from '..'
import Logger from './logger'


export default function guildDataToViewString(g: GuildData, maxLength = 2048, errorMessage?: string, includeMetainfo = false) {
  const gd = JSON.parse(JSON.stringify(g))
  if (gd) {
    delete gd.channelInstance
    delete gd.roleInstance
    if (includeMetainfo) {
      gd.host = hostname()
      gd.workerIndex = Manager.getMeta().workerIndex
      gd.shard = ((typeof g.sharder === 'number') ? g.sharder : g.sharder.getLowBits()) % Core.options.shardCount
    }

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
  if (guilddata.length > maxLength) guilddata = `\`\`\`json\n${JSON.stringify(gd || { error: 'Guild Data Error' }, null, 1)}\`\`\``
  if (guilddata.length > maxLength) guilddata = `\`\`\`json\n${JSON.stringify(gd || { error: 'Guild Data Error' })}\`\`\``
  if (guilddata.length > maxLength) {
    Logger.log(JSON.stringify(gd, null, 2))
    guilddata = errorMessage || 'Guild data too long. Check logs.'
  }

  return guilddata
}
