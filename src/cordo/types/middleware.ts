import { GuildData } from '../../types/datastructs'
import { InteractionApplicationCommandCallbackData } from './custom'


export type InteractionCallbackMiddleware = (data?: InteractionApplicationCommandCallbackData, guild?: GuildData) => any
