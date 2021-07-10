

export enum InteractionCallbackType {
  PONG = 1,
  CHANNEL_MESSAGE_WITH_SOURCE = 4,
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE = 5,
  DEFERRED_UPDATE_MESSAGE = 6,
  UPDATE_MESSAGE = 7
}

export enum InteractionResponseFlags {
  EPHEMERAL = 64
}

export enum InteractionType {
  COMMAND = 2,
  COMPONENT = 3
}

export enum ComponentType {
  LINE_BREAK = -5,
  ROW = 1,
  BUTTON = 2,
  SELECT = 3
}

export enum ButtonStyle {
  PRIMARY = 1,
  SECONDARY = 2,
  SUCCESS = 3,
  DANGER = 4,
  LINK = 5
}
