

export type FragileError = {
  /** a status code for the error, either 3 digit http codes or 5 digit custom codes */
  status: number
  /** a machine readable error identifier */
  name: string
  /** source of the error, an error can be passed down making it unclear where it happened first */
  source: string
  /** long description of the error - user facing */
  description?: string
  /** How to fix the error - user facing */
  fix?: string
}

export type Fragile<T>
  = [ FragileError, null ]
  | [ null, T ]
