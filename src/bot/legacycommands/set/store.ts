import { Message } from 'discord.js'
import { GuildData } from '../../../types/datastructs'
import { ReplyFunction, CommandHandler, SettingsSubcommand } from '../../../types/commands'
import { Platform } from '../../../types/context'
import { Core } from '../../../index'
import Const from '../../const'
import DatabaseManager from '../../database-manager'


export default class SetStoreHandler implements CommandHandler, SettingsSubcommand {

  public getMetaInfo(_g: GuildData): [ string, string, any? ] {
    return [
      'stores',
      '=cmd_settings_change_store'
    ]
  }

  public handle(_mes: Message, args: string[], g: GuildData, reply: ReplyFunction): boolean {
    if (args.length < 1) {
      reply(
        Core.text(g, '=cmd_set_store_missing_args_1'),
        [
          Core.text(g, '=cmd_set_store_missing_args_2'),
          '',
          '',
          Core.text(g, '=cmd_set_store_list_enabled'),
          '',
          (Const.platforms
            .filter(s => this.isPlatformEnabled(s, g))
            .map(s => `${s.emoji} ${s.name}`)
            .join('\n') || Core.text(g, '=cmd_set_store_list_enabled_none')),
          '',
          '',
          Core.text(g, '=cmd_set_store_list_disabled'),
          '',
          (Const.platforms
            .filter(s => !this.isPlatformEnabled(s, g))
            .map(s => `${s.emoji} ${s.name}`)
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
      DatabaseManager.changeSetting(g, 'platforms', 0b11111111111111111111111)
      reply(
        Core.text(g, '=cmd_set_store_success_all_1'),
        Core.text(g, '=cmd_set_store_success_all_2')
      )
      return
    }

    if ([ 'none', 'no' ].includes(storeName)) {
      DatabaseManager.changeSetting(g, 'platforms', 0)
      reply(
        Core.text(g, '=cmd_set_store_success_none_1'),
        Core.text(g, '=cmd_set_store_success_none_2')
      )
      return
    }

    const platform = this.getPlatformFromKeyword(storeName)

    if (!platform) {
      reply(
        Core.text(g, '=cmd_set_store_not_found_1', { name: args[0] + cutoff }),
        Core.text(g, '=cmd_set_store_not_found_2', { name: args[0] + cutoff })
      )
      return false
    }

    if (platform.bit === undefined) {
      reply(
        Core.text(g, '=cmd_set_store_not_supported_1', { icon: platform.emoji.string, name: platform.name }),
        Core.text(g, '=cmd_set_store_not_supported_2', { icon: platform.emoji.string, name: platform.name })
      )
      return false
    }

    if (args.length < 2) {
      reply(
        Core.text(g, this.isPlatformEnabled(platform, g) ? '=cmd_set_store_status_on_1' : '=cmd_set_store_status_off_1', { icon: platform.emoji.string, name: platform.name }),
        Core.text(g, this.isPlatformEnabled(platform, g) ? '=cmd_set_store_status_on_2' : '=cmd_set_store_status_off_2', { icon: platform.emoji.string, name: platform.name })
      )
      return false
    }

    if ([ 'on', 'true', '1', 'enable' ].includes(args[1].toLowerCase())) {
      DatabaseManager.changeSetting(g, 'platforms', g.platformsRaw | platform.bit)
      reply(
        Core.text(g, '=cmd_set_store_success_on_1', { icon: platform.emoji.string, name: platform.name }),
        Core.text(g, '=cmd_set_store_success_on_2', { icon: platform.emoji.string, name: platform.name })
      )
    } else if ([ 'off', 'false', '0', 'disable' ].includes(args[1].toLowerCase())) {
      DatabaseManager.changeSetting(g, 'platforms', g.platformsRaw & ~platform.bit)
      reply(
        Core.text(g, '=cmd_set_store_success_off_1', { icon: platform.emoji.string, name: platform.name }),
        Core.text(g, '=cmd_set_store_success_off_2', { icon: platform.emoji.string, name: platform.name })
      )
    } else if ([ 'only', 'single', 'just' ].includes(args[1].toLowerCase())) {
      DatabaseManager.changeSetting(g, 'platforms', platform.bit)
      reply(
        Core.text(g, '=cmd_set_store_success_only_1', { icon: platform.emoji.string, name: platform.name }),
        Core.text(g, '=cmd_set_store_success_only_2', { icon: platform.emoji.string, name: platform.name })
      )
    } else {
      reply(
        Core.text(g, '=cmd_set_store_invalid_setting_1', { input: args[1], icon: platform.emoji.string, name: platform.name }),
        Core.text(g, '=cmd_set_store_invalid_setting_2', { input: args[1], icon: platform.emoji.string, name: platform.name })
      )
    }
    return true
  }

  private getPlatformFromKeyword(search: string): Platform {
    for (const store of Const.platforms) {
      if (store.id === search.toLowerCase()) return store
      if (store.name === search.toLowerCase()) return store
    }
    for (const store of Const.platforms) {
      if (store.id.includes(search.toLowerCase())) return store
      if (store.name.includes(search.toLowerCase())) return store
    }
    return null
  }

  private isPlatformEnabled(platform: Platform, guild: GuildData) {
    return (guild.platformsRaw & platform.bit) !== 0
  }

}
