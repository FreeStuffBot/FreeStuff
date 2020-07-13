import { Message, TextChannel } from "discord.js";
import { ReplyFunction, GuildData, Command } from "../../types";
import { Core } from "../../index";
import Const from "../const";


export default class SettingsCommand extends Command {

  public constructor() {
    super({
      name: 'settings',
      desc: '=cmd_settings_desc',
      trigger: [ 'set', 'settings', 'config', 'configure', 'change' ],
      serverManagerOnly: true
    });
  }

  public handle(mes: Message, args: string[], g: GuildData, repl: ReplyFunction): boolean {
    if (!g) {
      repl(
        Core.text(g, '=cmd_error_readd_1'),
        Core.text(g, '=cmd_error_readd_2', {
          discordInvite: Const.discordInvite
        })
      );
      return;
    }

    if (args.length < 1) {
      // Ewww, someone clean this up please lol
      const c = '@FreeStuff set';
      mes.channel.send({ embed: {
        title: Core.text(g, '=cmd_settings_missing_args_1'),
        description: Core.text(g, '=cmd_settings_missing_args_2'),
        footer: { text: `@${mes.author.tag}` },
        color: 0x2f3136,
        fields: [
          '`' + c + ' channel #' + ((g && g.channelInstance) ? g.channelInstance.name : 'channel') + '` ' + Core.text(g, '=cmd_settings_change_channel'),
          '`' + c + ' mention @' + ((g && g.roleInstance) ? g.roleInstance.name : 'role') + '` ' + Core.text(g, '=cmd_settings_change_mention'),
          '`' + c + ' mention` ' + Core.text(g, '=cmd_settings_change_mention_noone'),
          '`' + c + ' theme ' + (g ? (g.theme + 1) : 1) + '` ' + Core.text(g, '=cmd_settings_change_theme', { themeListLink: Const.themeListLink }),
          '`' + c + ' currency ' + (g ? (g.currency == 'euro' ? '€' : '$') : '€') + '` ' + Core.text(g, '=cmd_settings_change_currency'),
          '`' + c + ' reaction ' + (g ? (g.react ? 'on' : 'off') : 'off') + '` ' + Core.text(g, '=cmd_settings_change_reaction'),
          '`' + c + ' trash ' + (g ? (g.trashGames ? 'on' : 'off') : 'off') + '` ' + Core.text(g, '=cmd_settings_change_trash'),
          '`' + c + ' minimum price ' + (g ? g.price : '3') + '` ' + Core.text(g, '=cmd_settings_change_min_price'),
          '`' + c + ' language ' + Core.text(g, '=lang_name_en') + '` ' + Core.text(g, '=cmd_settings_change_language'),
          '`' + c + ' until ' + (g ? (g.altDateFormat ? 'date' : 'weekday') : 'weekday') + '` ' + Core.text(g, '=cmd_settings_change_until'),
        ].map(l => { return { name: l.split('` ')[0] + '`', value: l.split('` ')[1] }})
      }});
      return true;
    }

    switch (args[0].toLowerCase()) {
      case 'channel':
        this.subcmdChannel(mes, args, g, repl);
        break;
        
      case 'mention':
      case 'role':
        this.subcmdMention(mes, args, g, repl);
        break;
        
      case 'theme':
        this.subcmdTheme(mes, args, g, repl);
        break;
        
      case 'currency':
        this.subcmdCurrency(mes, args, g, repl);
        break;
        
      case 'react':
      case 'reaction':
        this.subcmdReact(mes, args, g, repl);
        break;

      case 'trash':
      case 'bad':
      case 'garbage':
        this.subcmdTrash(mes, args, g, repl);
        break;

      case 'minimum':
      case 'minimumprice':
      case 'min':
      case 'price':
      case 'cost':
        this.subcmdMinPrice(mes, args, g, repl);
        break;

      case 'language':
      case 'lang':
      case 'local':
      case 'locale':
        this.subcmdLanguage(mes, args, g, repl);
        break;

      case 'until':
        this.subcmdAltDateFormat(mes, args, g, repl);
        break;

      case 'prefix':
        repl(
          Core.text(g, '=cmd_change_prefix_1'),
          Core.text(g, '=cmd_change_prefix_2'),
        );
        break;

      default:
        repl(
          Core.text(g, '=cmd_settings_not_found_1', { name: args[0] }),
          Core.text(g, '=cmd_settings_not_found_2'),
        );
        break;
    }
    return true;
  }

  private subcmdChannel(orgmes: Message, args: string[], g: GuildData, reply: ReplyFunction) {
    if (args.length < 2) {
      reply(
        Core.text(g, '=cmd_set_channel_missing_args_1'),
        Core.text(g, '=cmd_set_channel_missing_args_2', {
          channel: orgmes.guild.channels.filter(c => c.type == 'text').random().name
        })
      );
      return;
    }
    let channel = orgmes.mentions.channels.first();
    if (!channel) {
      const result = isNaN(parseInt(args[1]))
        ? orgmes.guild.channels.find(find => find.name.toLowerCase() == args[1].toLowerCase())
        : orgmes.guild.channels.find(find => find.id == args[1]);
      if (!result) {
        reply(
          Core.text(g, '=cmd_set_channel_not_found_1'),
          Core.text(g, '=cmd_set_channel_not_found_2', { channel: args[1] })
        );
        return;
      } else if (result.type != 'text' && result.type != 'news') {
        reply(
          Core.text(g, '=cmd_set_channel_to_voice_or_news_channel_1'),
          Core.text(g, '=cmd_set_channel_to_voice_or_news_channel_2')
        );
        return;
      } else channel = result as TextChannel;
    }
    if (channel.type != 'text' && channel.type != 'news') {
      reply(
        Core.text(g, '=cmd_set_channel_to_voice_or_news_channel_1'),
        Core.text(g, '=cmd_set_channel_to_voice_or_news_channel_2')
      );
    } else if (!channel.guild.me.permissionsIn(channel).has('VIEW_CHANNEL')) {
      reply(
        Core.text(g, '=cmd_set_channel_nosee_1'),
        Core.text(g, '=cmd_set_channel_nosee_2', { channel: `#${channel.name}` }),
        undefined,
        undefined,
        'https://media.discordapp.net/attachments/672907465670787083/690942039218454558/unknown.png'
      );
    } else if (!channel.guild.me.permissionsIn(channel).has('SEND_MESSAGES')) {
      reply(
        Core.text(g, '=cmd_set_channel_nosend_1'),
        Core.text(g, '=cmd_set_channel_nosend_2', { channel: `#${channel.name}` }),
        undefined,
        undefined,
        'https://media.discordapp.net/attachments/672907465670787083/690942039218454558/unknown.png'
      );
    } else {
      Core.databaseManager.changeSetting(orgmes.guild, g, 'channel', channel.id);
      reply(
        Core.text(g, '=cmd_set_channel_success_1'),
        Core.text(g, '=cmd_set_channel_success_2', { channel: channel.toString() })
      );
    }
  }

  private subcmdMention(orgmes: Message, args: string[], g: GuildData, reply: ReplyFunction) {
    if (args.length < 2) {
      if (g.role) {
        Core.databaseManager.changeSetting(orgmes.guild, g, 'roleMention', undefined);
        reply(
          Core.text(g, '=cmd_set_mention_success_none_changed_1'),
          Core.text(g, '=cmd_set_mention_success_none_changed_2')
        );
      } else {
        reply(
          Core.text(g, '=cmd_set_mention_success_none_unchanged_1'),
          Core.text(g, '=cmd_set_mention_success_none_unchanged_2')
        );
      }
      return;
    }
    if (orgmes.mentions.everyone) {
      if (g.channelInstance && !orgmes.guild.me.permissionsIn(g.channelInstance).has('MENTION_EVERYONE')) {
        reply(
          Core.text(g, '=cmd_set_mention_no_permission_1'),
          Core.text(g, '=cmd_set_mention_no_permission_2', { channel: g.channelInstance.toString() })
        );
        return;
      }
      Core.databaseManager.changeSetting(orgmes.guild, g, 'roleMention', '1');
      reply(
        Core.text(g, '=cmd_set_mention_success_everyone_1'),
        Core.text(g, '=cmd_set_mention_success_everyone_2')
      );
      return;
    }
    if (!orgmes.mentions.roles.size) {
      reply(
        Core.text(g, '=cmd_set_mention_not_found_1'),
        Core.text(g, '=cmd_set_mention_not_found_2', { name: args[1] })
      );
      return;
    }

    const role = orgmes.mentions.roles.first();
    if (!role) return;
    Core.databaseManager.changeSetting(orgmes.guild, g, 'roleMention', role.id);
    reply(
      Core.text(g, '=cmd_set_mention_success_regular_1'),
      Core.text(g, '=cmd_set_mention_success_regular_2', { role: role.toString() })
    );
  }

  private subcmdTheme(orgmes: Message, args: string[], g: GuildData, reply: ReplyFunction) {
    if (args.length < 2) {
      reply(
        Core.text(g, '=cmd_set_theme_missing_args_1'),
        Core.text(g, '=cmd_set_theme_missing_args_2', { themeListLink: Const.themeListLink })
      );
      return;
    }
    if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].includes(args[1])) {
      Core.databaseManager.changeSetting(orgmes.guild, g, 'theme', parseInt(args[1]) - 1);
      reply(
        Core.text(g, '=cmd_set_theme_success_1'),
        Core.text(g, '=cmd_set_theme_success_2')
      );
    } else {
      reply(
        Core.text(g, '=cmd_set_theme_not_found_1'),
        Core.text(g, '=cmd_set_theme_not_found_2', {
          name: args[1],
          themeListLink: Const.themeListLink
        })
      );
    }
  }

  private subcmdCurrency(orgmes: Message, args: string[], g: GuildData, reply: ReplyFunction) {
    if (args.length < 2) {
      reply(
        Core.text(g, '=cmd_set_currency_missing_args_1'),
        Core.text(g, '=cmd_set_currency_missing_args_2')
      );
      return;
    }
    if (['€', 'euro', 'eur'].includes(args[1].toLowerCase())) {
      if (g.currency != 'euro')
        Core.databaseManager.changeSetting(orgmes.guild, g, 'currency', 0);
      reply(
        Core.text(g, '=cmd_set_currency_success_euro_1'),
        Core.text(g, '=cmd_set_currency_success_euro_2')
      );
    } else if (['$', 'dollar', 'usd'].includes(args[1].toLowerCase())) {
      if (g.currency != 'usd')
        Core.databaseManager.changeSetting(orgmes.guild, g, 'currency', 1);
      reply(
        Core.text(g, '=cmd_set_currency_success_dollar_1'),
        Core.text(g, '=cmd_set_currency_success_dollar_2')
      );
    } else {
      reply(
        Core.text(g, '=cmd_set_currency_not_found_1', { name: args[1] }),
        Core.text(g, '=cmd_set_currency_not_found_2')
      );
    }
  }
  
  private subcmdReact(orgmes: Message, args: string[], g: GuildData, reply: ReplyFunction) {
    if (args.length < 2) {
      reply(
        Core.text(g, g.react ? '=cmd_set_react_status_on_1' : '=cmd_set_react_status_off_1'),
        Core.text(g, g.react ? '=cmd_set_react_status_on_2' : '=cmd_set_react_status_off_2')
      );
      return;
    }
    if (['on', 'true', '1'].includes(args[1].toLowerCase())) {
      if (!g.react)
        Core.databaseManager.changeSetting(orgmes.guild, g, 'react', 1);
      reply(
        Core.text(g, '=cmd_set_react_success_on_1'),
        Core.text(g, '=cmd_set_react_success_on_2')
      );
    } else if (['off', 'false', '0'].includes(args[1].toLowerCase())) {
      if (g.react)
        Core.databaseManager.changeSetting(orgmes.guild, g, 'react', 0);
      reply(
        Core.text(g, '=cmd_set_react_success_off_1'),
        Core.text(g, '=cmd_set_react_success_off_2')
      );
    } else {
      reply(
        Core.text(g, '=cmd_set_react_not_found_1'),
        Core.text(g, '=cmd_set_react_not_found_2', { name: args[1] })
      );
    }
  }
  
  private subcmdTrash(orgmes: Message, args: string[], g: GuildData, reply: ReplyFunction) {
    if (args.length < 2) {
      reply(
        Core.text(g, g.trashGames ? '=cmd_set_trash_status_on_1' : '=cmd_set_trash_status_off_1'),
        Core.text(g, g.trashGames ? '=cmd_set_trash_status_on_2' : '=cmd_set_trash_status_off_2')
      );
      return;
    }
    if (['on', 'true', '1', 'yes'].includes(args[1].toLowerCase())) {
      if (!g.trashGames)
        Core.databaseManager.changeSetting(orgmes.guild, g, 'trash', 1);
      reply(
        Core.text(g, '=cmd_set_trash_success_on_1'),
        Core.text(g, '=cmd_set_trash_success_on_2')
      );
    } else if (['off', 'false', '0', 'no'].includes(args[1].toLowerCase())) {
      if (g.trashGames)
        Core.databaseManager.changeSetting(orgmes.guild, g, 'trash', 0);
      reply(
        Core.text(g, '=cmd_set_trash_success_off_1'),
        Core.text(g, '=cmd_set_trash_success_off_2')
      );
    } else {
      reply(
        Core.text(g, '=cmd_set_trash_not_found_1'),
        Core.text(g, '=cmd_set_trash_not_found_2', { text: args[1] })
      );
    }
  }

  private subcmdMinPrice(orgmes: Message, args: string[], g: GuildData, reply: ReplyFunction) {
    if (args.length < 2) {
      const pricestr = g.currency == 'euro'
        ? `${g.price}€`
        : `$ ${g.price}`;
      reply(
        Core.text(g, '=cmd_set_price_status_1', { price: pricestr }),
        Core.text(g, '=cmd_set_price_status_2')
      );
      return;
    }
    const clear = inp => inp.split('$').join('').split('€').join('').split(',').join('.');
    let price = parseFloat(clear(args[1]));
    if (isNaN(price) && args.length > 2) {
      price = parseFloat(clear(args[2]));
    }
    if (isNaN(price)) {
      reply(
        Core.text(g, '=cmd_set_price_invalid_1', { input: args.length == 2 ? args[1] : args[2] }),
        Core.text(g, '=cmd_set_price_invalid_2')
      );
      return;
    }
    price = ~~((price) * 100) / 100;
    const pricestr = g.currency == 'euro'
      ? `${price}€`
      : `$ ${price}`;
    if (price < 0) {
      reply(
        Core.text(g, '=cmd_set_price_to_something_negative_like_what_the_fuck_this_doesnt_make_sense_1'),
        Core.text(g, '=cmd_set_price_to_something_negative_like_what_the_fuck_this_doesnt_make_sense_2', { price: pricestr })
      );
    } else if (price > 100) {
      reply(
        Core.text(g, '=cmd_set_price_too_high_1'),
        Core.text(g, '=cmd_set_price_too_high_2', { price: pricestr })
      );
    } else {
      if (price == 69) {
        reply(
          Core.text(g, '=cmd_set_price_success_eastergg_1'),
          Core.text(g, '=cmd_set_price_success_eastergg_2')
        );
      } else if (price == 0) {
        reply(
          Core.text(g, '=cmd_set_price_success_all_1'),
          Core.text(g, '=cmd_set_price_success_all_2')
        );
      } else {
        reply(
          Core.text(g, '=cmd_set_price_success_1', { username: orgmes.author.username }),
          Core.text(g, '=cmd_set_price_success_2', { price: pricestr })
        );
      }
      Core.databaseManager.changeSetting(orgmes.guild, g, 'price', price);
    }
  }

  private subcmdLanguage(orgmes: Message, args: string[], g: GuildData, reply: ReplyFunction) {
    if (args.length < 2) {
      reply(
        Core.text(g, '=cmd_set_language_status_1'),
        Core.text(g, '=cmd_set_language_status_2')
          + (g.language.startsWith('en') ? '' : '\n\n' + Core.text(g, '=cmd_set_language_status_2_en', { language: Core.text(g, '=lang_name_en') }))
          + '\n\n' + Core.languageManager.displayLangList().map(l => `${l.endsWith(Core.languageManager.get(g, 'lang_name_en') + ')') ? '☛' : '•'}‎ ${l}`).join('\n')
      );
      return;
    }

    if (args[1].startsWith('<')) {
      reply(
        Core.text(g, '=cmd_set_language_notfound_easteregg_1'),
        Core.text(g, '=cmd_set_language_notfound_easteregg_2', { input: args[1] })
      );
      return;
    }

    let lang = Core.languageManager.languageByName(args[1]);
    if (lang == 'en-US' && args.join(' ').includes('eu')) lang = 'en-GB';
    if (!lang) {
      reply(
        Core.text(g, '=cmd_set_language_notfound_1'),
        Core.text(g, '=cmd_set_language_notfound_2')
        + (g.language.startsWith('en') ? '' : '\n\n' + Core.text(g, '=cmd_set_language_notfound_2_en'))
        + '\n\n' + Core.languageManager.displayLangList().map(l => `${l.endsWith(Core.languageManager.get(g, 'lang_name_en') + ')') ? '☛' : '•'}‎ ${l}`).join('\n')
      );
      return;
    }
    
    const langid = Core.languageManager.languageToId(lang);
    Core.databaseManager.changeSetting(orgmes.guild, g, 'language', langid);

    reply(
      Core.languageManager.getRaw(lang, 'cmd_set_language_success_1'),
      Core.languageManager.getRaw(lang, 'cmd_set_language_success_2')
    );
  }
  
  private subcmdAltDateFormat(orgmes: Message, args: string[], g: GuildData, reply: ReplyFunction) {
    if (args.length < 2) {
      reply(
        Core.text(g, g.altDateFormat ? '=cmd_set_until_weekday_status_1' : '=cmd_set_until_date_status_1'),
        Core.text(g, g.altDateFormat ? '=cmd_set_until_weekday_status_2' : '=cmd_set_until_date_status_2')
      );
      return;
    }

    if (['day', 'name', 'week', 'weekday'].includes(args[1].toLowerCase())) {
      if (!g.altDateFormat)
        Core.databaseManager.changeSetting(orgmes.guild, g, 'altdate', 1);
      reply(
        Core.text(g, '=cmd_set_until_weekday_success_1'),
        Core.text(g, '=cmd_set_until_weekday_success_2')
      );
    } else if (['date', 'time'].includes(args[1].toLowerCase())) {
      if (g.altDateFormat)
        Core.databaseManager.changeSetting(orgmes.guild, g, 'altdate', 0);
      reply(
        Core.text(g, '=cmd_set_until_date_success_1'),
        Core.text(g, '=cmd_set_until_date_success_2')
      );
    } else {
      reply(
        Core.text(g, '=cmd_set_until_not_found_1'),
        Core.text(g, '=cmd_set_until_not_found_2', { text: args[1] })
      );
    }
  }
  
}