

export default class StringUtils {

  public static readonly LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
  public static readonly UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  public static readonly NUMBERS = '0123456789'
  public static readonly ROMAN = StringUtils.LOWERCASE + StringUtils.UPPERCASE
  public static readonly BASE64 = StringUtils.ROMAN + StringUtils.NUMBERS + '_-'

  public static generateWord(length: number, alphabet: string) {
    let out = ''
    while (length-- > 0)
      out += alphabet[~~(Math.random() * alphabet.length)]
    return out
  }

  //

  public static sanitizeProductName(name: string) {
    return name
      .split(' ').join('-')
      .split('').filter(c => this.BASE64.includes(c)).join('')
  }

}
