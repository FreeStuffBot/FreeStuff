

/*
 * Controller
 */


export interface Shard {
  id: number
  server: string
  status: 'ok' | 'timeout' | 'offline' | 'crashed'
  lastHeartbeat: number
  guildCount: number
}


export interface ShardStatusPayload extends Shard {
  totalShardCount: number
}


export type ShardAction = {
  id: 'startup',
  shardCount?: number
  shardId?: number
} | {
  id: 'shutdown'
}


export type ShardTask = {
  id: 'ready'
} | {
  id: 'assigned'
  shardId: number
  shardCount: number
}


export type ManagerCommand = ({
  id: 'shutdown'
} | {
  id: 'reload_lang'
} | {
  id: 'resend_to_guild'
  guilds: string[]
}) & {
  reason?: string
}


export type Experiment = {
  _id: string
  amount: number
  group: string
}


export type ShardStatus = 'idle' | 'reconnecting' | 'startup' | 'disconnected' | 'identifying' | 'operational'
