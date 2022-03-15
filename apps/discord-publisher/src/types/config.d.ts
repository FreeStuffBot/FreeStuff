

export type configjs = {
  mongoUrl: string
  rabbitUrl: string
  behavior: {
    /** the amount of subtasks to split off */
    publishSplitTaskAmount: number
  }
}
