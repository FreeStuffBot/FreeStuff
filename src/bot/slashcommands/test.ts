import Const from "../const";
import { config, Core } from "../../index";
import { GuildData, InteractionCommandHandler, Interaction, InteractionReplyFunction, InteractionResponseFlags } from "../../types";


export default class NewTestCommand extends InteractionCommandHandler {
  
  private readonly placeholderThumbnail = 'https://media.discordapp.net/attachments/672907465670787083/830794212894572574/thumbnail_placeholder.png'

  private testCooldown = [ ];

  public async handle(command: Interaction, data: GuildData, reply: InteractionReplyFunction): Promise<boolean> {
    // TODO MAKE SURE TO CHECK FOR PERMISSIONS !!!!!!!

    const guildid = command.guild_id
    const guild = guildid ? await Core.guilds.fetch(guildid) : undefined
    if (!guild) {
      reply('ChannelMessageWithSource', {
        title: '=cmd_not_available_in_dms_1',
        description: '=cmd_not_available_in_dms_2'
      })
      return true
    }

    if (this.testCooldown.includes(guildid)) {
      reply('ChannelMessageWithSource', {
        flags: InteractionResponseFlags.EPHEMERAL,
        title: '=cmd_on_cooldown_1',
        description: '=cmd_on_cooldown_2',
        context: { time: '10' }
      })
      return true;
    }

    if (!data) {
      Core.databaseManager.addGuild(guild);
      reply('ChannelMessageWithSource', {
        title: '=cmd_error_fixable_1',
        description: '=cmd_error_fixable_2',
        context: { discordInvite: Const.links.supportInvite }
      });
      return;
    }
    if (!data.channelInstance) {
      reply('ChannelMessageWithSource', {
        title: '=cmd_test_nochannel_1',
        description: '=cmd_test_nochannel_2',
        context: { channel: `#${guild.channels.cache.filter(c => c.type == 'text').random().name}` }
      });
      return true;
    }
    if (!data.channelInstance.guild.me.permissionsIn(data.channelInstance).has('VIEW_CHANNEL')) {
      reply('ChannelMessageWithSource', {
        title: '=cmd_test_nosee_1',
        description: '=cmd_test_nosee_2',
        context: { channel: data.channelInstance.toString() }
      });
      return true;
    }
    if (!data.channelInstance.guild.me.permissionsIn(data.channelInstance).has('SEND_MESSAGES')) {
      reply('ChannelMessageWithSource', {
        title: '=cmd_test_nosend_1',
        description: '=cmd_test_nosend_2',
        context: { channel: data.channelInstance.toString() }
      });
      return true;
    }
    if (!data.channelInstance.guild.me.permissionsIn(data.channelInstance).has('EMBED_LINKS')
        && Const.themesWithEmbeds.includes(data.theme)) {
        reply('ChannelMessageWithSource', {
          title: '=cmd_test_noembeds_1',
          description: '=cmd_test_noembeds_2',
          context: { channel: data.channelInstance.toString() }
        });
      return true;
    }
    if (!data.channelInstance.guild.me.permissionsIn(data.channelInstance).has('USE_EXTERNAL_EMOJIS')
        && Const.themesWithExtemotes[data.theme]) {
        reply('ChannelMessageWithSource', {
          title: '=cmd_test_extemotes_1',
          description: '=cmd_test_extemotes_2'
        });
      return true;
    }
    
    try {
      Core.messageDistributor.test(guild, {
        id: 0,
        title: Core.text(data, '=cmd_test_announcement_header'),
        org_price: {
          euro: 19.99,
          dollar: 19.99
        },
        price: {
          euro: 0,
          dollar: 0
        },
        store: 'steam',
        thumbnail: {
          blank: this.placeholderThumbnail,
          full: this.placeholderThumbnail,
          org: this.placeholderThumbnail,
          tags: this.placeholderThumbnail
        },
        kind: 'game',
        description: 'Satisfactory is a first-person open-world factory building game with a dash of exploration and combat. Play alone or with friends, explore an alien planet, create multi-story factories, and enter conveyor belt heaven!', //Core.text(data, '=cmd_test_announcement_description'),
        tags: [],
        rating: .74,
        urls: {
          org: Const.links.testgame,
          default: Const.links.testgame,
          browser: Const.links.testgame
        },
        org_url: Const.links.testgame,
        url: Const.links.testgame,
        flags: 0,
        until: null,
        type: 'free',
        store_meta: {
          steam_subids: '12345 98760'
        }
      });
    } catch (ex) {
      reply('ChannelMessageWithSource', {
        title: '=cmd_error_fixable_1',
        description: '=cmd_error_fixable_2'
      });
    }

    reply('ChannelMessageWithSource', {
      content: ':+1: ** **',
      flags: InteractionResponseFlags.EPHEMERAL
    })
    
    if (config.admins.includes(command.member.user.id)) return true;

    this.testCooldown.push(guild.id);
    setTimeout(() => {
      this.testCooldown.splice(this.testCooldown.indexOf(guild.id), 1);
    }, 1000 * 10);
    return true;
  }

}
