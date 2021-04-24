import { MessageOptions } from 'discord.js'
import { GameInfo } from 'freestuff'
import { GuildData } from '../../types/datastructs'
import { Theme } from '../../types/context'
import { Core } from '../../index'
import Const from '../../bot/const'


export default class ThemeSix implements Theme {

  public build(content: GameInfo, data: GuildData, settings: { test?: boolean, disableMention?: boolean }): [string, MessageOptions] {
    return [
      (data.roleInstance && !settings.disableMention) ? data.roleInstance.toString() : '',
      {
        embed: {
          author: {
            name: Core.text(data, '=announcement_header')
          },
          title: content.title,
          url: content.urls.default,
          footer: {
            text: settings.test
              ? Core.text(data, '=announcement_footer_test')
              : Core.text(data, '=announcement_footer', { website: Const.links.websiteClean })
          },
          image: {
            url: Core.sharder.runExperimentOnServer('announcement_tags', data)
              ? content.thumbnail.full
              : content.thumbnail.org
          },
          color: Const.embedDefaultColor,
          thumbnail: {
            url: Const.storeIcons[content.store] + '&size=32',
            width: 32,
            height: 32
          }
        }
      }
    ]
  }

}
