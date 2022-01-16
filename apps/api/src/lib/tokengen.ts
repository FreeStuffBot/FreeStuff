/**
 * @author Andreas May <andreas@maanex.me>
 * @copyright 2020 File Authors
 */


export default class TokenGen {

  public static readonly ALPHABET_LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'.split('')
  public static readonly ALPHABET_UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  public static readonly NUMBERS = '0123456789'.split('')
  public static readonly HEX = '0123456789abcdef'.split('')
  public static readonly ALPHABET = [ ...TokenGen.ALPHABET_LOWERCASE, ...TokenGen.ALPHABET_UPPERCASE ]
  public static readonly ALPHABET_NUMBERS = [ ...TokenGen.ALPHABET, ...TokenGen.NUMBERS ]
  public static readonly BASE64 = [ ...TokenGen.ALPHABET_NUMBERS, '-', '_' ]
  public static readonly NON_VISUALLY_SIMILAR_ALPHANUMERICAL = 'abcdefghkmnpqrstwABCDEFGHKLMNPRTW2346789'.split('')

  public static string(charset: string[], length: number): string {
    let out = ''
    while (length-- > 0)
      out += charset[Math.floor(Math.random() * charset.length)]
    return out
  }

}
