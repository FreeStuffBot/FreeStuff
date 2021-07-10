import { Message } from 'discord.js'
import { Store } from 'freestuff'
import { GuildData } from '../../../types/datastructs'
import { ReplyFunction, CommandHandler, SettingsSubcommand } from '../../../types/commands'
import { FilterableStore, StoreData } from '../../../types/context'
import { Core } from '../../../index'
import LanguageManager from '../../../bot/language-manager'
import Emojis from '../../../lib/emojis'


export default class SetStoreHandler implements CommandHandler, SettingsSubcommand {

  public getMetaInfo(_g: GuildData): [ string, string, any? ] {
    return [
      'stores',
      '=cmd_settings_change_store'
    ]
  }

  public handle(mes: Message, args: string[], g: GuildData, reply: ReplyFunction): boolean {
    if (args.length < 1) {
      const storeListAvailable = Object.keys(Emojis.store)
        .map((e: Store) => this.getStoreInfo(e, g))
        .filter(s => s.bit !== undefined)
      reply(
        Core.text(g, '=cmd_set_store_missing_args_1'),
        [
          Core.text(g, '=cmd_set_store_missing_args_2'),
          '',
          '',
          Core.text(g, '=cmd_set_store_list_enabled'),
          '',
          (storeListAvailable
            .filter(s => this.isStoreOn(s, g))
            .map(s => `${s.icon} ${s.name}`)
            .join('\n') || Core.text(g, '=cmd_set_store_list_enabled_none')),
          '',
          '',
          Core.text(g, '=cmd_set_store_list_disabled'),
          '',
          (storeListAvailable
            .filter(s => !this.isStoreOn(s, g))
            .map(s => `${s.icon} ${s.name}`)
            .join('\n') || Core.text(g, '=cmd_set_store_list_disabled_none'))
        ].join('\n')
      )
      return false
    }

    let storeName = args[0].toLowerCase()
    let cutoff = ''
    if (storeName.endsWith('game')) storeName = storeName.substr(0, storeName.length - 4)
    if (storeName.endsWith('games')) storeName = storeName.substr(0, storeName.length - 5)
    if (storeName.includes('.')) storeName = storeName.split('.')[0]
    if (args[1] && args[1].toLocaleLowerCase().startsWith('game')) cutoff += ' ' + args.splice(1, 1)[0]
    if (args[1] && args[1].toLocaleLowerCase().startsWith('store')) cutoff += ' ' + args.splice(1, 1)[0]
    if (args[1] && args[1].toLocaleLowerCase().startsWith('bundle')) cutoff += ' ' + args.splice(1, 1)[0]

    if ([ 'all', 'everything' ].includes(storeName)) {
      Core.databaseManager.changeSetting(mes.guild, g, 'stores', 0b11111111111111111111111)
      reply(
        Core.text(g, '=cmd_set_store_success_all_1'),
        Core.text(g, '=cmd_set_store_success_all_2')
      )
      return
    }

    if ([ 'none', 'no' ].includes(storeName)) {
      Core.databaseManager.changeSetting(mes.guild, g, 'stores', 0)
      reply(
        Core.text(g, '=cmd_set_store_success_none_1'),
        Core.text(g, '=cmd_set_store_success_none_2')
      )
      return
    }

    const store = this.getStoreFromKeyword(storeName, g)

    if (!store) {
      reply(
        Core.text(g, '=cmd_set_store_not_found_1', { name: args[0] + cutoff }),
        Core.text(g, '=cmd_set_store_not_found_2', { name: args[0] + cutoff })
      )
      return false
    }

    if (store.bit === undefined) {
      reply(
        Core.text(g, '=cmd_set_store_not_supported_1', { icon: store.icon, name: store.name }),
        Core.text(g, '=cmd_set_store_not_supported_2', { icon: store.icon, name: store.name })
      )
      return false
    }

    if (args.length < 2) {
      reply(
        Core.text(g, this.isStoreOn(store, g) ? '=cmd_set_store_status_on_1' : '=cmd_set_store_status_off_1', { icon: store.icon, name: store.name }),
        Core.text(g, this.isStoreOn(store, g) ? '=cmd_set_store_status_on_2' : '=cmd_set_store_status_off_2', { icon: store.icon, name: store.name })
      )
      return false
    }

    if ([ 'on', 'true', '1', 'enable' ].includes(args[1].toLowerCase())) {
      Core.databaseManager.changeSetting(mes.guild, g, 'stores', g.storesRaw | store.bit)
      reply(
        Core.text(g, '=cmd_set_store_success_on_1', { icon: store.icon, name: store.name }),
        Core.text(g, '=cmd_set_store_success_on_2', { icon: store.icon, name: store.name })
      )
    } else if ([ 'off', 'false', '0', 'disable' ].includes(args[1].toLowerCase())) {
      Core.databaseManager.changeSetting(mes.guild, g, 'stores', g.storesRaw & ~store.bit)
      reply(
        Core.text(g, '=cmd_set_store_success_off_1', { icon: store.icon, name: store.name }),
        Core.text(g, '=cmd_set_store_success_off_2', { icon: store.icon, name: store.name })
      )
    } else if ([ 'only', 'single', 'just' ].includes(args[1].toLowerCase())) {
      Core.databaseManager.changeSetting(mes.guild, g, 'stores', store.bit)
      reply(
        Core.text(g, '=cmd_set_store_success_only_1', { icon: store.icon, name: store.name }),
        Core.text(g, '=cmd_set_store_success_only_2', { icon: store.icon, name: store.name })
      )
    } else {
      reply(
        Core.text(g, '=cmd_set_store_invalid_setting_1', { input: args[1], icon: store.icon, name: store.name }),
        Core.text(g, '=cmd_set_store_invalid_setting_2', { input: args[1], icon: store.icon, name: store.name })
      )
    }
    return true
  }

  private getStoreFromKeyword(search: string, g: GuildData): StoreData {
    const storeList = Object
      .keys(Emojis.store)
      .map((e: Store) => this.getStoreInfo(e, g))
    for (const store of storeList) {
      if (store.key === search.toLowerCase()) return store
      if (store.name === search.toLowerCase()) return store
    }
    for (const store of storeList) {
      if (store.key.includes(search.toLowerCase())) return store
      if (store.name.includes(search.toLowerCase())) return store
    }
    return null
  }

  private getStoreInfo(store: Store, g: GuildData): StoreData {
    return {
      name: store === 'other' ? 'Other Stores' : LanguageManager.get(g, 'platform_' + store),
      key: store,
      icon: Emojis.store[store].string,
      bit: <unknown> FilterableStore[store.toUpperCase()] as number
    }
  }

  private isStoreOn(store: StoreData, guild: GuildData) {
    return (guild.storesRaw & store.bit) !== 0
  }

}
