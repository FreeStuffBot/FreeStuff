
export enum ProductFlag {
  /** Low quality game */
  TRASH = 1 << 0,

  /** Third party key provider */
  THIRDPARTY = 1 << 1,

  /** Permanent monetization model change, only for well known titles */
  PERMANENT = 1 << 2,

  /** Purely cosmetic flag given out by the team for titles that deserve extra attention */
  STAFF_PICK = 1 << 3,
}


/** @see ProductFlag */
export type ProductFlags = number
