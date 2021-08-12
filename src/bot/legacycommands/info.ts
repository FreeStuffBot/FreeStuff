import { Message } from 'discord.js'
import { GuildData } from '../../types/datastructs'
import { Command, ReplyFunction } from '../../types/commands'
import Const from '../const'
import { Core } from '../../index'
import DatabaseManager from '../database-manager'
import LanguageManager from '../../bot/language-manager'
import Experiments from '../../controller/experiments'


export default class InfoCommand extends Command {

  public constructor() {
    super({
      name: 'info',
      desc: '=cmd_info_desc',
      trigger: [ 'info', 'information', 'about' ]
    })
  }

  public handle(_mes: Message, _args: string[], g: GuildData, repl: ReplyFunction): boolean {
    const translationCredits = g.language.startsWith('en')
      ? ''
      : `\n\n${Core.text(g, '=translation_by')}\n${LanguageManager.getRaw(g.language, 'translators').split(', ').map(n => `• ${n}`).join('\n')}`

    let replyText = Core.text(g, '=cmd_info_2', {
      amazingPeople: Const.links.team,
      website: Const.links.website,
      inviteLink: Const.links.botInvite,
      discordInvite: Const.links.supportInvite
    })

    replyText += translationCredits

    if (Experiments.runExperimentOnServer('slashcommand_hint_about', g))
      replyText += '\n\n:new: ' + Core.text(g, '=slash_command_introduction_label_long', { command: '/about' })

    repl(
      Core.text(g, '=cmd_info_1'),
      replyText,
      'Copyright © 2020-2021 FreeStuff',
      0x00B0F4
    )
    return true
  }

}
