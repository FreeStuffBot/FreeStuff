/* eslint-disable camelcase */

import { InteractionEmoji } from './ibase'


// Button

export type MessageComponentButton = {
  type: 2
  label?: string
  emoji?: Partial<InteractionEmoji>
  disabled?: boolean
} & ({
  style: 1 | 2 | 3 | 4
  custom_id: string
} | {
  style: 5
  url: string
})

// Selects

export type MessageComponentSelectOption = {
  label: string
  value: string
  description?: string
  emoji?: Partial<InteractionEmoji>
  default?: boolean
}

export type MessageComponentSelectMenu = {
  type: 3
  custom_id: string
  options: MessageComponentSelectOption[]
  placeholder?: string
  min_values?: number
  max_values?: number
  disabled?: boolean
}

// Generic

export type MessageComponent = MessageComponentButton | MessageComponentSelectMenu

// Action Row

export type ActionRow = {
  type: 1
  components: MessageComponent[]
}
