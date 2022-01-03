import { Localisation, Logger } from "@freestuffbot/common"
import Cordo from "cordo"
import { config } from ".."
import * as express from 'express'


export default class Modules {

  public static initCordo() {
    Cordo.init({
      botId: config.discordClientId,
      contextPath: [ __dirname, '..' ],
      // TODO
      // botAdmins: (id: string) => RemoteConfig.botAdmins.includes(id),
      botAdmins: (id: string) => config.admins.includes(id),
      texts: {
        interaction_not_owned_title: '=interaction_not_owned_1',
        interaction_not_owned_description: '=interaction_not_owned_2',
        interaction_not_permitted_title: '=interaction_not_permitted_1',
        interaction_not_permitted_description_generic: '=interaction_not_permitted_2_generic',
        interaction_not_permitted_description_bot_admin: '=interaction_not_permitted_2_bot_admin',
        interaction_not_permitted_description_guild_admin: '=interaction_not_permitted_2_admin',
        interaction_not_permitted_description_manage_server: '=interaction_not_permitted_2_manage_server',
        interaction_not_permitted_description_manage_messages: '=interaction_not_permitted_2_manage_messages',
        interaction_failed: 'We are very sorry but an error occured while processing your command. Please try again.'
      }
    })
    Cordo.addMiddlewareInteractionCallback((data, guild) => Localisation.translateObject(data, guild, data._context, 14))
    // Cordo.setMiddlewareGuildData(guildid => DatabaseManager.getGuildData(guildid))
    // Cordo.setMiddlewareApiResponseHandler(res => Metrics.counterApiResponses.labels({ status: res.status }).inc())
  }

  public static startServer() {
    const app = express()
    app.set('trust proxy', 1)

    app.use('/', Cordo.useWithExpress(config.discordPublicKey))

    app.listen(config.port, undefined, () => {
      Logger.process(`Server launched at port ${config.port}`)
    })
  }

}
