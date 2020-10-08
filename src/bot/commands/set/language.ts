import { CommandHandler, GuildData, ReplyFunction, SettingsSubcommand } from "../../../types";
import { Core } from "../../../index";
import { Message } from "discord.js";


export default class SetLanguageHandler implements CommandHandler, SettingsSubcommand {

  public getMetaInfo(g: GuildData): [ string, string, any? ] {
    return [
      'language ' + Core.text(g, '=lang_name_en'),
      '=cmd_settings_change_language'
    ];
  }

  public handle(mes: Message, args: string[], g: GuildData, reply: ReplyFunction): boolean {
    if (args.length < 1) {
      reply(
        Core.text(g, '=cmd_set_language_status_1'),
        Core.text(g, '=cmd_set_language_status_2')
          + (g.language.startsWith('en') ? '' : '\n\n' + Core.text(g, '=cmd_set_language_status_2_en', { language: Core.text(g, '=lang_name_en') }))
          + '\n\n' + Core.languageManager.displayLangList(true).map(l => `${l.endsWith(Core.languageManager.get(g, 'lang_name_en') + ')') ? '☛' : ''}‎ ${l}`).join('\n')
      );
      return false;
    }

    if (args[0].startsWith('<')) {
      reply(
        Core.text(g, '=cmd_set_language_notfound_easteregg_1'),
        Core.text(g, '=cmd_set_language_notfound_easteregg_2', { input: args[0] })
      );
      return false;
    }

    let lang = Core.languageManager.languageByName(args[0]);
    if (lang.startsWith('en')) lang = Core.localisation.isGuildInEurope(mes.guild) ? 'en-GB' : 'en-US';

    const details = args.join(' ').toLocaleLowerCase();
    if (lang == 'en-US' && (details.includes('eu') || details.includes('gb') || details.includes('brit'))) lang = 'en-GB';
    if (lang == 'en-GB' && (details.includes('us') || details.includes('america'))) lang = 'en-US';

    if (!lang) {
      reply(
        Core.text(g, '=cmd_set_language_notfound_1'),
        Core.text(g, '=cmd_set_language_notfound_2')
        + (g.language.startsWith('en') ? '' : '\n\n' + Core.text(g, '=cmd_set_language_notfound_2_en'))
        + '\n\n' + Core.languageManager.displayLangList(true).map(l => `${l.endsWith(Core.languageManager.get(g, 'lang_name_en') + ')') ? '☛' : ''}‎ ${l}`).join('\n')
      );
      return false;
    }
    
    const langid = Core.languageManager.languageToId(lang);
    Core.databaseManager.changeSetting(mes.guild, g, 'language', langid);

    reply(
      Core.languageManager.getRaw(lang, 'cmd_set_language_success_1'),
      Core.languageManager.getRaw(lang, 'cmd_set_language_success_2')
    );

    return true;
  }

}