import { Long } from "mongodb";
import { getGitCommit } from "../util/git-parser";
import { FreeStuffBot, Core } from "../index";
import FreeCommand from "./commands/free";
import { Util } from "../util/util";
import { GuildData } from "types";


export default class Sharder {

  private errorCounter = 0;
  private experiments = {};

  public constructor(bot: FreeStuffBot) {
    // if (Core.singleShard) return;
    Core.fsapi.on('operation', this.executeCommand);

    this.updateManager('rebooting');

    bot.on('ready', () => {
      this.updateManager();
      setInterval(() => {
        this.updateManager();
      }, 1000 * 20);
    });
  }

  public async updateManager(status?: 'ok' | 'partial' | 'offline' | 'rebooting' | 'fatal') {
    const commit = await getGitCommit();
    const res = await Core.fsapi.postStatus('discord', status ?? 'ok', {
      totalShardCount: Core.options.shardCount,
      guildCount: Core.guilds.cache.size,
      versionDetails: commit.subject,
      versionAuthor: commit.author.name,
      versionTime: commit.time,
    });
    if (res._status != 200) {
      if (this.errorCounter++ % 10 == 0)
        console.warn(`Failed to report status to manager service. (${this.errorCounter - 1})`)
      return
    }

    const data = res.data as any
    if (!data) return
    const newExperiments = {}
    data.experiments
      ?.filter(e => e.amount)
      .forEach(e => newExperiments[e._id] = e)
    this.experiments = newExperiments
  }

  public async executeCommand(command: string, args: string[]) {
    switch(command) {
      case 'shutdown':
        await Core.sharder.updateManager('offline');
        console.log('[MANAGER] Shutdown.');
        process.exit(0);

      case 'reload_lang':
        Core.languageManager.load();
        console.log('[MANAGER] Reload language cache.');
        break;

      case 'resend_to_guild':
        console.log('[MANAGER] Resend received');
        for (const guildid of args) {
          if (!Util.belongsToShard(Long.fromString(guildid))) continue
          const guildData = await Core.databaseManager.getGuildData(guildid)
          const freebies = FreeCommand.getCurrentFreebies();
          Core.messageDistributor.sendToGuild(guildData, freebies, false, false);
          console.log(`Resent to ${guildid}`);
        }
        break;
    }
  }

  public runExperimentOnServer(experimentName: string, guildData: GuildData): boolean {
    if (!(experimentName in this.experiments)) return false
    
    const experiment = this.experiments[experimentName]
    const chance = Math.sin(typeof guildData.sharder === 'number'
      ? guildData.sharder
      : guildData.sharder.getLowBits()) / 2 + .5
    if (chance > experiment.amount) return false
    
    if (!experiment.group) return true
    switch (experiment.group) {
      case 'all': return true
      case 'beta': return guildData.beta
      case 'europe': return Core.localisation.isGuildInEurope(guildData.channelInstance?.guild)
      case 'usa': return Core.localisation.isGuildInAmerica(guildData.channelInstance?.guild)
    }
    return false
  }

}