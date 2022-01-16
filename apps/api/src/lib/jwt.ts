/**
 * @author Andreas May <andreas@maanex.me>
 * @copyright 2020 File Authors
 */

import { readFileSync } from 'fs'
import jwtlib from 'jsonwebtoken'
import { config } from '..'
import { UserAuthPayload } from '../types/application'
import { SigninTokenPayload } from './loginlinks'


export default class JWT {

  private static readonly privateKey = readFileSync('./vault/jwt.private.key')
  private static readonly publicKey = readFileSync('./vault/jwt.public.key')

  public static signRaw(payload: object, options: jwtlib.SignOptions = {}): Promise<string> {
    return new Promise(res => jwtlib.sign(payload, this.privateKey, options, (_err, token) => res(token)))
  }

  public static decodeRaw(token: string, allowUnsigned = false): Promise<Record<string, any> | undefined> {
    if (allowUnsigned)
      return new Promise(res => res(jwtlib.decode(token, { json: true })))
    return new Promise(res => jwtlib.verify(token, this.privateKey, {}, (_err, decoded) => res(decoded)))
  }

  //

  public static signAuth(user: UserAuthPayload): Promise<string> {
    return this.signRaw(user, { expiresIn: config.security.tokenValidFor })
  }

  public static signSigninToken(token: SigninTokenPayload): Promise<string> {
    return this.signRaw(token, { expiresIn: config.security.emailLinkValidFor })
  }

}
