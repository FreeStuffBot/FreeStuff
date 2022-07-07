import { GuildData as GuildDataType } from '@freestuffbot/typings'


declare module 'cordo' {
  interface GuildData extends GuildDataType {}
}
