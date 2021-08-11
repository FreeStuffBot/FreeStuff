import Const from '../const'
import { Core } from '../../index'
import DatabaseManager from '../database-manager'
import { CommandInteraction, InteractionCommandHandler, InteractionReplyFunction } from '../../types/interactions'
import { GuildData } from '../../types/datastructs'


export default class NewAboutCommand extends InteractionCommandHandler {

  public handle(_command: CommandInteraction, data: GuildData, reply: InteractionReplyFunction): boolean {
    const translationCredits = data.language.startsWith('en')
      ? ''
      : `\n\n${Core.text(data, '=translation_by')}\n${LanguageManager.getRaw(data.language, 'translators').split(', ').map(n => `• ${n}`).join('\n')}`

    reply('ChannelMessageWithSource', {
      title: '=cmd_info_1',
      description: Core.text(data, '=cmd_info_2', {
        amazingPeople: Const.links.team,
        website: Const.links.website,
        inviteLink: Const.links.botInvite,
        discordInvite: Const.links.supportInvite
      }) + translationCredits,
      footer: 'Copyright © 2020-2021 FreeStuff'
    })
    return true
  }

}
