import { UserType } from '@freestuffbot/common'
import { Response } from 'express'


declare module 'express' {
  interface Response {
    locals: {
      // user login
      user?: UserType

      // app login
      suid?: string
      access?: string
      appid?: string
    }
  }
}
