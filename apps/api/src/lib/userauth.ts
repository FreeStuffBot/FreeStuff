/**
 * @author Andreas May <andreas@maanex.me>
 * @copyright 2020 File Authors
 */

import { UserAuthPayload } from '../types/application'
import Mongo from '../database/mongo'
import JWT from './jwt'
import { UserType } from '../database/models/user.model'
import Passwords from './passwords'
import Timestamps from './timestamps'
import InputValidator from './inputvalidator'
import { isValidObjectId, Types } from 'mongoose'
import DBUsers from '../database/interface/db-users'
import LoginLinks from './loginlinks'


export default class UserAuth {

  public static async parseUser(header: string): Promise<UserAuthPayload | null> {
    const payload: any = await JWT.decodeRaw(header, false)
    if (!payload) return null

    return {
      id: payload.id
    }
  }

  /**
   * Logs a user in. Takes a unique user identifier (like email) and a password
   * @returns tupel with JWT, user object and boolean whether setup is required or not
   */
  public static async loginUser(user: string, password: string): Promise<[string, any, boolean]> {
    if (!user || !password) return null

    const User = Mongo.User
    let found: UserType | null = null

    if (user.includes('@')) {
      found = await User.findOne({ email: user })
    } else if (InputValidator.PHONE_NUMBER_REGEX.test(user)) {
      found = await User.findOne({ phoneNumber: user })
    } else {
      // invalid user
      return null
    }

    if (!found)
      return null

    const correctPassword = Passwords.check(password, found.password)

    if (!correctPassword)
      return null

    const loggedInPreviously = !!found.lastLogin

    found.lastLogin = Timestamps.now()
    found.save()

    return [ await JWT.signAuth({ id: found._id }), found, !loggedInPreviously ]
  }

  /**
   * Logs a user in. Takes a signinToken
   * @returns tupel with JWT, user object and boolean whether setup is required or not
   */
  public static async signinUser(signinToken: string): Promise<[string, any, boolean]> {
    const res = await JWT.decodeRaw(signinToken)
    if (!res)
      return null

    const { key, uid } = res
    if (!isValidObjectId(uid))
      return null
    const user = new Types.ObjectId(uid)

    const entry = await Mongo.SigninKey.findOne({ key, user })
    if (!entry)
      return null

    const found = await DBUsers.fetch(user)
    if (!found)
      return null

    /** only users can login with a token */
    if (found.role !== 'user')
      return null

    const loggedInPreviously = !!found.lastLogin

    found.lastLogin = Timestamps.now()
    found.save()

    LoginLinks.invalidateKey(key, user)

    return [ await JWT.signAuth({ id: uid }), found, !loggedInPreviously ]
  }

}
