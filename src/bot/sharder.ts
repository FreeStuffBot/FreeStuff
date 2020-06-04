import { FreeStuffBot, Core, config } from "../index";
import { ShardStatusPayload } from "types";
import fetch from "node-fetch";
import { hostname } from "os";


export default class Sharder {

  public constructor(bot: FreeStuffBot) {
    if (Core.singleShard) return;
    this.updateManager();
    setInterval(() => {
      this.updateManager();
    }, 1000 * 60);
  }

  public async updateManager() {
    const serverName = await hostname();
    const payload: ShardStatusPayload = {
      id: Core.options.shardId,
      totalShardCount: Core.options.shardCount,
      guildCount: Core.guilds.size,
      lastHeartbeat: Date.now(),
      server: serverName,
      status: 'ok'
    }
    this.sendToManager(payload);
  }

  public sendToManager(payload: ShardStatusPayload) {
    try {
      fetch(config.sharder.url, {
        headers: {
          'Content-Type': 'application/json',
          'authorization': config.sharder.auth
        },
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch (ex) { }
  }

}