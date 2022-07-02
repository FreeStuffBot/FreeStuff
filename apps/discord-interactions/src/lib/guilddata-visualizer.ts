import { hostname } from 'os'
import { Logger, SanitizedGuildType } from '@freestuffbot/common'
import Tracker from './tracker'


export default function guildDataToViewString(g: SanitizedGuildType, maxLength = 2048, errorMessage?: string, includeMetainfo = false): string {
  const gd = { ...g } as any || { error: 'Guild Data Error' }
  if (!gd.error) {
    delete gd._changes
    if (includeMetainfo)
      gd.host = hostname()

    gd.currency = gd.currency?.name ?? '<unknown>'
    gd.price = gd.price?.name ?? '<unknown>'
    gd.theme = gd.theme?.name ?? '<unknown>'
    gd.platformsList = gd.platformsList?.map(p => p.name) ?? []
    gd.trackerList = Object
      .entries(Tracker.TRACKING_POINT ?? {})
      .filter(v => (gd.tracker & v[1]) !== 0)
      .map(v => v[0])

    gd.id = gd.id?.toString?.() ?? gd.id
    gd.channel = gd.channel?.toString?.() ?? gd.channel
    gd.role = gd.role?.toString?.() ?? gd.role
  }

  delete gd.sharder
  delete gd.settings
  delete gd.filter
  delete gd.tracker
  delete gd.platformsRaw

  let guilddata = `\`\`\`yaml\n${yamlifyJson(gd)}\`\`\``
  if (guilddata.length > maxLength) guilddata = `\`\`\`json\n${JSON.stringify(gd, null, 2)}\`\`\``
  if (guilddata.length > maxLength) guilddata = `\`\`\`json\n${JSON.stringify(gd, null, 1)}\`\`\``
  if (guilddata.length > maxLength) guilddata = `\`\`\`json\n${JSON.stringify(gd)}\`\`\``
  if (guilddata.length > maxLength) {
    Logger.log(JSON.stringify(gd, null, 2))
    guilddata = errorMessage || 'Guild data too long. Check logs.'
  }

  return guilddata
}

function yamlifyJson(object: any) {
  let out = ''
  for (const [ key, value ] of Object.entries(object)) {
    out += `\n${key}:`
    if (value === null || value === undefined)
      out += ' None'
    else if (typeof value === 'object')
      out += `\n${(value as any[]).map?.(v => ` - ${v}`).join('\n') ?? JSON.stringify(value)}`
    else if (typeof value === 'boolean')
      out += ` ${value ? 'Enabled' : 'Disabled'}`
    else
      out += ` ${value}`
  }
  return out.substring(1)
}
