

/*
 * Controller
 */


export interface Shard {
  id: number;
  server: string;
  status: 'ok' | 'timeout' | 'offline' | 'crashed';
  lastHeartbeat: number;
  guildCount: number;
}


export interface ShardStatusPayload extends Shard {
  totalShardCount: number;
}


export type ManagerCommand = {
  id: 'startup',
  shardCount?: number,
  shardId?: number
} | {
  id: 'shutdown'
}
