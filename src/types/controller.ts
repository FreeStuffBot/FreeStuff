

/*
 * Controller
 */


export type ShardStatus = 'idle' | 'reconnecting' | 'startup' | 'disconnected' | 'identifying' | 'operational' // | 'timeout'

export interface Shard {
  id: number
  status: ShardStatus
}


export type WorkerTask = {
  ids: number[]
  total: number
}


export type WorkerAction = {
  id: 'startup',
  task: WorkerTask
} | {
  id: 'shutdown'
}


export type WorkerCommand = ({
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

