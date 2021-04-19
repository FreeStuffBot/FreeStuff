import { TextChannel, Message } from 'discord.js'
import { CommandHandler, GuildData, ReplyFunction, SettingsSubcommand } from '../../../types'
import { Core } from '../../../index'


export default class SetChannelHandler implements CommandHandler, SettingsSubcommand {

  public getMetaInfo(g: GuildData): [ string, string, any? ] {
    return [
      'channel #' + ((g && g.channelInstance) ? g.channelInstance.name : 'channel'),
      '=cmd_settings_change_channel'
    ]
  }

  public handle(mes: Message, args: string[], g: GuildData, reply: ReplyFunction): boolean {
    if (args.length < 1) {
      reply(
        Core.text(g, '=cmd_set_channel_missing_args_1'),
        Core.text(g, '=cmd_set_channel_missing_args_2', {
          channel: mes.guild.channels.cache.filter(c => c.type === 'text').random().name
        })
      )
      return false
    }
    let channel = mes.mentions.channels.first()
    if (!channel) {
      const result = isNaN(parseInt(args[0], 10))
        ? mes.guild.channels.cache.find(find => find.name.toLowerCase() === args[0].toLowerCase())
        : mes.guild.channels.cache.find(find => find.id === args[0])
      if (!result) {
        reply(
          Core.text(g, '=cmd_set_channel_not_found_1'),
          Core.text(g, '=cmd_set_channel_not_found_2', { channel: args[0] })
        )
        return false
      } else if (result.type !== 'text' && result.type !== 'news') {
        reply(
          Core.text(g, '=cmd_set_channel_to_voice_or_news_channel_1'),
          Core.text(g, '=cmd_set_channel_to_voice_or_news_channel_2')
        )
        return false
      } else { channel = result as TextChannel }
    }
    if (channel.type !== 'text' && channel.type !== 'news') {
      reply(
        Core.text(g, '=cmd_set_channel_to_voice_or_news_channel_1'),
        Core.text(g, '=cmd_set_channel_to_voice_or_news_channel_2')
      )
    } else if (!channel.guild.me.permissionsIn(channel).has('VIEW_CHANNEL')) {
      reply(
        Core.text(g, '=cmd_set_channel_nosee_1'),
        Core.text(g, '=cmd_set_channel_nosee_2', { channel: `#${channel.name}` }),
        undefined,
        undefined,
        'https://media.discordapp.net/attachments/672907465670787083/690942039218454558/unknown.png'
      )
    } else if (!channel.guild.me.permissionsIn(channel).has('SEND_MESSAGES')) {
      reply(
        Core.text(g, '=cmd_set_channel_nosend_1'),
        Core.text(g, '=cmd_set_channel_nosend_2', { channel: `#${channel.name}` }),
        undefined,
        undefined,
        'https://media.discordapp.net/attachments/672907465670787083/690942039218454558/unknown.png'
      )
    } else {
      Core.databaseManager.changeSetting(mes.guild, g, 'channel', channel.id)
      reply(
        Core.text(g, '=cmd_set_channel_success_1'),
        Core.text(g, '=cmd_set_channel_success_2', { channel: channel.toString() })
      )
    }

    return true
  }

}
