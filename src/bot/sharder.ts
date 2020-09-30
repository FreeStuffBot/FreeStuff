import { FreeStuffBot, Core } from "../index";


export default class Sharder {

  private errorCounter = 0;

  public constructor(bot: FreeStuffBot) {
    // if (Core.singleShard) return;
    this.updateManager();
    setInterval(() => {
      this.updateManager();
    }, 1000 * 20);

    Core.fsapi.on('operation', this.executeCommand);
  }

  public async updateManager() {
    const res = await Core.fsapi.postStatus('discord', 'ok', {
      totalShardCount: Core.options.shardCount,
      guildCount: Core.guilds.cache.size
    })
    if (res._status != 200 && this.errorCounter++ % 10 == 0) {
      console.warn(`Failed to report status to manager service. (${this.errorCounter - 1})`)
    }
  }

  public executeCommand(command: string, args: string[]) {
    switch(command) {
      case 'shutdown':
        console.log('[MANAGER] Shutdown.');
        process.exit(0);

      case 'reload_lang':
        Core.languageManager.load();
        console.log('[MANAGER] Reload language cache.');
        break;
      
    }
  }

}