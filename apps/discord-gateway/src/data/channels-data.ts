import { DataChannel } from "../types/data"


export default class ChannelsData {

  public static parseRaw(raw: any): DataChannel[] {
    if (typeof raw !== "object") return null
    return raw.map(item => ChannelsData.parseSingle(item))
  }

  public static parseSingle(raw: any): DataChannel {
    return {
      id: raw.id,
      name: raw.name,
      type: raw.type,
      parent_id: raw.parent_id,
      position: raw.position,
      topic: raw.topic,
      nsfw: raw.nsfw,
      permission_overwrites: raw.permission_overwrites
    }
  }

}
