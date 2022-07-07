/* eslint-disable @typescript-eslint/no-unused-vars */
import { UserType } from '@freestuffbot/common'
import { Response } from 'express'


declare module 'express' {
  interface Response {
    locals: {
    }
  }
}
