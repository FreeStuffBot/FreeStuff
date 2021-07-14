import { GuildData as GuildDataType } from './datastructs'


declare module 'cordo' {
  interface GuildData extends GuildDataType {}
}
