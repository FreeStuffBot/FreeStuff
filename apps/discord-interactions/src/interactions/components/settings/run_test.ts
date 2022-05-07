import { Const, CustomPermissions, DataChannel, Errors, SanitizedGuildType } from '@freestuffbot/common'
import RabbitHole, { TaskId } from '@freestuffbot/rabbit-hole'
import { ReplyableComponentInteraction } from 'cordo'
import PermissionStrings from 'cordo/dist/lib/permission-strings'
import Tracker from '../../../lib/tracker'
import DiscordGateway from '../../../services/discord-gateway'


const testCooldown = [ ]
const testCooldownHarsh = [ ]

export default async function (i: ReplyableComponentInteraction) {
  if (i.member && !PermissionStrings.containsManageServer(i.member.permissions))
    return i.ack()
  if (!i.guild_id)
    return i.ack()

  /* Handle timeouts */
  if (testCooldownHarsh.includes(i.guild_id))
    return i.ack()
  if (testCooldown.includes(i.guild_id)) {
    i.replyPrivately({
      title: '=cmd_on_cooldown_1',
      description: '=cmd_on_cooldown_2',
      _context: { time: '15' }
    })
    testCooldownHarsh.push(i.guild_id)
    return
  }

  /* Track the interaction */
  Tracker.set(i.guildData, 'ACTION_TEST_TRIGGERED')

  const [ err1, guildData ] = await i.guildData.fetch()
  if (err1) return Errors.handleErrorAndCommunicate(err1, i)

  const [ err2, channels ] = await DiscordGateway.getChannels(i.guild_id)
  if (err2) return Errors.handleErrorAndCommunicate(err2, i)

  const channel = getChannel(guildData, channels)
  const goodToGo = await checkRequirements(i, channel)
  if (!goodToGo) {
    testCooldown.push(i.guild_id)
    setTimeout(() => {
      testCooldown.splice(testCooldown.indexOf(i.guild_id), 1)
      testCooldownHarsh.splice(testCooldownHarsh.indexOf(i.guild_id), 1)
    }, 1000 * 5)
    return
  }

  /* Send announcement */
  try {
    RabbitHole.publish({
      t: TaskId.DISCORD_TEST,
      g: i.guild_id
    })

    if (channel.id === i.channel_id) {
      i.ack()
    } else {
      i.replyPrivately({
        title: '=cmd_test_success_1',
        description: '=cmd_test_success_2',
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

function getChannel(guildData: SanitizedGuildType, channels: DataChannel[]): DataChannel | null {
  if (!guildData?.channel) return null
  const str = guildData.channel.toString()
  return channels.find(c => c.id === str) ?? null
}

async function checkRequirements(i: ReplyableComponentInteraction, channel: DataChannel): Promise<boolean> {
  if (!i.guildData) {
    // DatabaseManager.addGuild(i.guild_id)
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

  const permissions = CustomPermissions.parseChannel(channel.permissions)

  if (!permissions.viewChannel) {
    i.replyPrivately({
      title: '=cmd_test_nosee_1',
      description: '=cmd_test_nosee_2',
      _context: { channel: channel.toString() }
    })
    return false
  }

  if (!permissions.sendMessages) {
    i.replyPrivately({
      title: '=cmd_test_nosend_1',
      description: '=cmd_test_nosend_2',
      _context: { channel: channel.toString() }
    })
    return false
  }

  if (!permissions.embedLinks) {
    i.replyPrivately({
      title: '=cmd_test_noembeds_1',
      description: '=cmd_test_noembeds_2',
      _context: { channel: channel.toString() }
    })
    return false
  }

  // TODO(highest) check if webhook exists
  // just GET on the webhook url to see if it's status 200, but rate limits somehow think about

  return true
}
