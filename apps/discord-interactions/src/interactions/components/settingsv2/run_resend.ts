import { ReplyableComponentInteraction } from 'cordo'
import RabbitHole, { TaskId } from '@freestuffbot/rabbit-hole'
import { Const, CustomPermissions, DataChannel, Errors, FSApiGateway, Logger, ProductFilter, SanitizedGuildType } from '@freestuffbot/common'
import PermissionStrings from 'cordo/dist/lib/permission-strings'
import Tracker from '../../../lib/tracker'
import DiscordGateway from '../../../services/discord-gateway'
import DatabaseGateway from '../../../services/database-gateway'


const testCooldown = [ ]
const testCooldownHarsh = [ ]

export default async function (i: ReplyableComponentInteraction) {
  if (i.member && !PermissionStrings.containsManageServer(i.member.permissions))
    return i.ack()
  if (!i.guild_id)
    return i.ack()

  // Handle timeouts
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

  // Track the interaction
  Tracker.set(i.guildData, 'ACTION_RESEND_TRIGGERED')
  
  const [ err1, guildData ] = await i.guildData.fetch()
  if (err1) return Errors.handleErrorAndCommunicate(err1, i)

  const [ err2, channels ] = await DiscordGateway.getChannels(i.guild_id, guildData.channel?.toString())
  if (err2) return Errors.handleErrorAndCommunicate(err2, i)

  const channel = getChannel(guildData, channels)
  const goodToGo = await checkRequirements(i, channel, guildData.webhook)
  if (!goodToGo) {
    testCooldown.push(i.guild_id)
    setTimeout(() => {
      testCooldown.splice(testCooldown.indexOf(i.guild_id), 1)
      testCooldownHarsh.splice(testCooldownHarsh.indexOf(i.guild_id), 1)
    }, 1000 * 5)
    return
  }

  // Load and handle list
  const [ err, freebies ] = FSApiGateway.getChannel('keep')
  if (err) return Errors.handleErrorAndCommunicate(err, i)

  if (!freebies?.length) {
    i.replyPrivately({
      title: '=cmd_resend_nothing_free_1',
      description: '=cmd_resend_nothing_free_2',
      _context: { discordInvite: Const.links.supportInvite }
    })
    return
  }

  const filteredList = ProductFilter.filterList(freebies, guildData)

  if (!filteredList?.length) {
    i.replyPrivately({
      title: '=cmd_resend_all_filtered_out_1',
      description: '=cmd_resend_all_filtered_out_2',
      _context: { discordInvite: Const.links.supportInvite }
    })
    return
  }

  // save changes so the publisher service has the newest data
  // if changes have been saved wait a bit for it to sync
  const changes = await DatabaseGateway.forceSaveChanges(i.guild_id)
  if (changes) await new Promise(res => setTimeout(res, 200))

  // Send announcement
  try {
    RabbitHole.publish({
      t: TaskId.DISCORD_RESEND,
      g: i.guild_id,
      p: filteredList.map(f => f.id)
    })

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
    Logger.error(ex)
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

async function checkRequirements(i: ReplyableComponentInteraction, channel: DataChannel, webhook: string): Promise<boolean> {
  if (!i.guildData) {
    // DatabaseManager.addGuild(i.guild_id)
    Logger.error('No guild data in run_resend::checkRequirements')
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
      title: '=cmd_resend_nosee_1',
      description: '=cmd_resend_nosee_2',
      _context: { channel: `<#${channel.id}>` }
    })
    return false
  }

  if (!permissions.sendMessages) {
    i.replyPrivately({
      title: '=cmd_resend_nosend_1',
      description: '=cmd_resend_nosend_2',
      _context: { channel: `<#${channel.id}>` }
    })
    return false
  }

  if (!permissions.embedLinks) {
    i.replyPrivately({
      title: '=cmd_resend_noembeds_1',
      description: '=cmd_resend_noembeds_2',
      _context: { channel: `<#${channel.id}>` }
    })
    return false
  }

  const [ webhookError, webhookValid ] = await DiscordGateway.validateWebhook(webhook)
  if (webhookError) {
    i.replyPrivately(Errors.handleErrorAndCommunicate(webhookError))
    return false
  }
  if (!webhookValid) {
    i.replyPrivately({
      title: '=cmd_resend_invalid_webhook_1',
      description: '=cmd_resend_invalid_webhook_2',
      _context: { channel: `<#${channel.id}>` }
    })
    return false
  }

  return true
}
