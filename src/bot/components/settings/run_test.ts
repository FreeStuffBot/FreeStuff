import { ReplyableComponentInteraction } from 'cordo'
import { TextChannel } from 'discord.js'
import PermissionStrings from '../../../lib/permission-strings'
import Tracker from '../../tracker'
import MessageDistributor from '../../message-distributor'
import Const from '../../const'
import DatabaseManager from '../../database-manager'
import { Core } from '../../..'


const testCooldown = [ ]
const testCooldownHarsh = [ ]

export default async function (i: ReplyableComponentInteraction) {
  if (i.member && !PermissionStrings.containsManageServer(i.member.permissions))
    return i.ack()

  /* Handle timeouts */
  if (testCooldownHarsh.includes(i.guild_id))
    return i.ack()
  if (testCooldown.includes(i.guild_id)) {
    i.replyPrivately({
      title: '=cmd_on_cooldown_1',
      description: '=cmd_on_cooldown_2',
      _context: { time: '30' }
    })
    testCooldownHarsh.push(i.guild_id)
    return
  }

  /* Track the interaction */
  Tracker.set(i.guildData, 'ACTION_TEST_TRIGGERED')

  /* Check if permissions are set */
  const channel = await Core.channels.fetch(i.guildData.channel.toString())
  const goodToGo = await checkRequirements(i, channel as TextChannel)
  if (!goodToGo) return

  /* Send announcement */
  try {
    MessageDistributor.test(i.guild_id, Const.testAnnouncementContent)
    if (channel.id === i.channel_id) {
      i.ack()
    } else {
      i.replyPrivately({
        title: '=cmd_resend_success_1',
        description: '=cmd_resend_success_2',
        _context: { channel: `<#${channel.id}>` }
      })
    }
  } catch (ex) {
    i.replyPrivately({
      title: '=cmd_error_fixable_1',
      description: '=cmd_error_fixable_2'
    })
  }

  testCooldown.push(i.guild_id)
  setTimeout(() => {
    testCooldown.splice(testCooldown.indexOf(i.guild_id), 1)
    testCooldownHarsh.splice(testCooldownHarsh.indexOf(i.guild_id), 1)
  }, 1000 * 10)
}

async function checkRequirements(i: ReplyableComponentInteraction, channel: TextChannel) {
  if (!i.guildData) {
    DatabaseManager.addGuild(i.guild_id)
    i.replyPrivately({
      title: '=cmd_error_fixable_1',
      description: '=cmd_error_fixable_2',
      _context: { discordInvite: Const.links.supportInvite }
    })
    return false
  }

  if (!channel) {
    i.replyPrivately({
      title: '=cmd_test_nochannel_1',
      description: '=cmd_test_nochannel_2',
      _context: { channel: '#free-games' }
    })
    return false
  }

  const self = await Core.guilds.resolve(i.guild_id).members.fetch(Core.user.id)
  const permissions = self.permissionsIn(channel)

  if (!permissions.has('VIEW_CHANNEL')) {
    i.replyPrivately({
      title: '=cmd_test_nosee_1',
      description: '=cmd_test_nosee_2',
      _context: { channel: channel.toString() }
    })
    return false
  }

  if (!permissions.has('SEND_MESSAGES')) {
    i.replyPrivately({
      title: '=cmd_test_nosend_1',
      description: '=cmd_test_nosend_2',
      _context: { channel: channel.toString() }
    })
    return false
  }

  if (!permissions.has('EMBED_LINKS')) {
    i.replyPrivately({
      title: '=cmd_test_noembeds_1',
      description: '=cmd_test_noembeds_2',
      _context: { channel: channel.toString() }
    })
    return false
  }

  return true
}
