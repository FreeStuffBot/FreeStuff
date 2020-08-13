import { FreeStuffBot, Core, config } from "../index";
import { ShardStatusPayload } from "types";
import fetch from "node-fetch";
import { hostname } from "os";


export default class Sharder {

  public constructor(bot: FreeStuffBot) {
    // if (Core.singleShard) return;
    this.updateManager();
    setInterval(() => {
      this.updateManager();
    }, 1000 * 3);
    // }, 1000 * 60);
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
    fetch(config.sharder.url, {
      headers: {
        'Content-Type': 'application/json',
        'authorization': config.sharder.auth
      },
      method: 'POST',
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => data.messages && this.evaluateManagerMessage(data.messages))
    .catch(ex => console.warn('Failed to report status to manager service.'));
  }

  public evaluateManagerMessage(input: string[]) {
    for (let message of input) {
      const command = message.split('=')[0];
      const args = message.substr(command.length);
      this.executeCommand(command, args);
    }
  }

  public executeCommand(command: string, args?: string) {
    switch(command) {
      case 'shutdown':
        console.log('Recieved shut down command from manager. Exit with code 0')
        process.exit(0);

      case 'reload_lang':
        // TODO
        break;
      
    }
  }

}