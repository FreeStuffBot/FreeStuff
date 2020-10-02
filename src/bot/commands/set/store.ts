import { CommandHandler, GuildData, ReplyFunction, SettingsSubcommand, FilterableStore, StoreData } from "../../../types";
import { Core } from "../../../index";
import { Message } from "discord.js";
import Const from "../../const";
import { Store } from "_apiwrapper/types";


export default class SetStoreHandler implements CommandHandler, SettingsSubcommand {

  private readonly storeList = Object.keys(Const.storeDisplayNames).map(this.getStoreInfo);
  private readonly storeListAvailable = Object.keys(Const.storeDisplayNames).map(this.getStoreInfo).filter(s => s.bit !== undefined);

  public getMetaInfo(g: GuildData): [ string, string, any? ] {
    return [
      'store <store> on|off|only',
      '=cmd_settings_change_store'
    ];
  }

  public handle(mes: Message, args: string[], g: GuildData, reply: ReplyFunction): boolean {
    if (args.length < 1) {
      reply(
        Core.text(g, '=cmd_set_store_missing_args_1'),
        Core.text(g, '=cmd_set_store_missing_args_2')
        + '\n\n'
        + Core.text(g, '=cmd_set_store_list_enabled')
        + '\n'
        + (this.storeListAvailable
          .filter(s => this.isStoreOn(s, g))
          .map(s => `${s.icon} ${s.name}`)
          .join('\n') || Core.text(g, '=cmd_set_store_list_enabled_none'))
        + '\n\n'
        + Core.text(g, '=cmd_set_store_list_disabled')
        + '\n'
        + (this.storeListAvailable
          .filter(s => !this.isStoreOn(s, g))
          .map(s => `${s.icon} ${s.name}`)
          .join('\n') || Core.text(g, '=cmd_set_store_list_disabled_none'))
      );
      return false;
    }

    let storeName = args[0].toLowerCase();
    let cutoff = '';
    if (storeName.endsWith('game')) storeName = storeName.substr(0, storeName.length - 4);
    if (storeName.endsWith('games')) storeName = storeName.substr(0, storeName.length - 5);
    if (storeName.includes('.')) storeName = storeName.split('.')[0];
    if (args[1] && args[1].toLocaleLowerCase().startsWith('game')) cutoff += ' ' + args.splice(1, 1)[0];
    if (args[1] && args[1].toLocaleLowerCase().startsWith('store')) cutoff += ' ' + args.splice(1, 1)[0];
    if (args[1] && args[1].toLocaleLowerCase().startsWith('bundle')) cutoff += ' ' + args.splice(1, 1)[0];

    if ([ 'all', 'everything' ].includes(storeName)) {
      Core.databaseManager.changeSetting(mes.guild, g, 'stores', 0b11111111111111111111111);
      reply(
        Core.text(g, '=cmd_set_store_success_all_1'),
        Core.text(g, '=cmd_set_store_success_all_2')
      );
      return;
    }

    if ([ 'none', 'no' ].includes(storeName)) {
      Core.databaseManager.changeSetting(mes.guild, g, 'stores', 0);
      reply(
        Core.text(g, '=cmd_set_store_success_none_1'),
        Core.text(g, '=cmd_set_store_success_none_2')
      );
      return;
    }

    const store = this.getStoreFromKeyword(storeName);

    if (!store) {
      reply(
        Core.text(g, '=cmd_set_store_not_found_1', { name: args[0] + cutoff }),
        Core.text(g, '=cmd_set_store_not_found_2', { name: args[0] + cutoff })
      );
      return false;
    }

    if (store.bit === undefined) {
      reply(
        Core.text(g, '=cmd_set_store_not_supported_1', { icon: store.icon, name: store.name }),
        Core.text(g, '=cmd_set_store_not_supported_2', { icon: store.icon, name: store.name })
      );
      return false;
    }

    if (args.length < 2) {
      reply(
        Core.text(g, this.isStoreOn(store, g) ? '=cmd_set_store_status_on_1' : '=cmd_set_store_status_off_1', { icon: store.icon, name: store.name }),
        Core.text(g, this.isStoreOn(store, g) ? '=cmd_set_store_status_on_2' : '=cmd_set_store_status_off_2', { icon: store.icon, name: store.name })
      );
      return false;
    }

    if (['on', 'true', '1', 'enable'].includes(args[1].toLowerCase())) {
      Core.databaseManager.changeSetting(mes.guild, g, 'stores', g.storesRaw | store.bit);
      reply(
        Core.text(g, '=cmd_set_store_success_on_1', { icon: store.icon, name: store.name }),
        Core.text(g, '=cmd_set_store_success_on_2', { icon: store.icon, name: store.name })
      );
    } else if (['off', 'false', '0', 'disable'].includes(args[1].toLowerCase())) {
      Core.databaseManager.changeSetting(mes.guild, g, 'stores', g.storesRaw & ~store.bit);
      reply(
        Core.text(g, '=cmd_set_store_success_off_1', { icon: store.icon, name: store.name }),
        Core.text(g, '=cmd_set_store_success_off_2', { icon: store.icon, name: store.name })
      );
    } else if (['only', 'single', 'just'].includes(args[1].toLowerCase())) {
      Core.databaseManager.changeSetting(mes.guild, g, 'stores', store.bit);
      reply(
        Core.text(g, '=cmd_set_store_success_only_1', { icon: store.icon, name: store.name }),
        Core.text(g, '=cmd_set_store_success_only_2', { icon: store.icon, name: store.name })
      );
    } else {
      reply(
        Core.text(g, '=cmd_set_store_invalid_setting_1', { input: args[1], icon: store.icon, name: store.name }),
        Core.text(g, '=cmd_set_store_invalid_setting_2', { input: args[1], icon: store.icon, name: store.name })
      );
    }
    return true;
  }

  private getStoreFromKeyword(search: string): StoreData {
    for (const store of this.storeList) {
      if (store.key == search.toLowerCase()) return store;
      if (store.name == search.toLowerCase()) return store;
    }
    for (const store of this.storeList) {
      if (store.key.includes(search.toLowerCase())) return store;
      if (store.name.includes(search.toLowerCase())) return store;
    }
    return null;
  }

  private getStoreInfo(store: Store): StoreData {
    return {
      name: store == 'other' ? 'Other Stores' : Const.storeDisplayNames[store],
      key: store,
      icon: Const.storeEmojis[store],
      bit: <unknown> FilterableStore[store.toUpperCase()] as number
    };
  }

  private isStoreOn(store: StoreData, guild: GuildData) {
    return (guild.storesRaw & store.bit) != 0;
  }

}