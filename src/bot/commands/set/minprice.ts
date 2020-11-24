import { CommandHandler, GuildData, ReplyFunction, SettingsSubcommand } from "../../../types";
import { Core } from "../../../index";
import { Message } from "discord.js";


export default class SetMinpriceHandler implements CommandHandler, SettingsSubcommand {

  public getMetaInfo(g: GuildData): [ string, string, any? ] {
    return [
      'minimum price ' + (g ? ((g.currency == 'euro' ? '€' : '$') + g.price) : '$3'),
      '=cmd_settings_change_min_price'
    ];
  }

  public handle(mes: Message, args: string[], g: GuildData, reply: ReplyFunction): boolean {
    if (args.length < 1) {
      const pricestr = g.currency == 'euro'
        ? `${g.price}€`
        : `$ ${g.price}`;
      reply(
        Core.text(g, '=cmd_set_price_status_1', { price: pricestr }),
        Core.text(g, '=cmd_set_price_status_2')
      );
      return false;
    }
    const clear = inp => inp.split('$').join('').split('€').join('').split(',').join('.');
    let price = parseFloat(clear(args[0]));
    if (isNaN(price) && args.length > 1) {
      price = parseFloat(clear(args[1]));
    }
    if (isNaN(price)) {
      reply(
        Core.text(g, '=cmd_set_price_invalid_1', { input: args.length == 1 ? args[0] : args[1] }),
        Core.text(g, '=cmd_set_price_invalid_2')
      );
      return false;
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
          Core.text(g, '=cmd_set_price_success_1', { username: mes.author.username }),
          Core.text(g, '=cmd_set_price_success_2', { price: pricestr })
        );
      }
      Core.databaseManager.changeSetting(mes.guild, g, 'price', price);
    }

    return true;
  }

}