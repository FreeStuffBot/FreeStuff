import { UserType } from '@freestuffbot/common'
import { Response } from 'express'


declare module 'express' {
  interface Response {
    locals: {
    }
  }
}
