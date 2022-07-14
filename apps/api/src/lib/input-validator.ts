

export default class InputValidator {

  public static NAME_MIN_LENGTH = 1
  public static NAME_MAX_LENGTH = 32
  /** returns an empty string if valid, error otherwise */
  public static validateName(name: string): string {
    if (!name) return 'Not found'
    if (name.length < this.NAME_MIN_LENGTH) return 'Too short'
    if (name.length > this.NAME_MAX_LENGTH) return 'Too long'
    return ''
  }

  public static EMAIL_REGEX = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/
  /** returns an empty string if valid, error otherwise */
  public static validateEmail(email: string, allowEmpty = false): string {
    if (!email) return allowEmpty ? '' : 'Email not found'
    if (!this.EMAIL_REGEX.test(email)) return 'Email invalid'
    return ''
  }

  /** returns an empty string if valid, error otherwise */
  public static validateProductId(id: string): string {
    if (!id) return 'Product id not present'
    if (!/^\d{2,10}$/g.test(id)) return 'Product id did not match criteria'
    return ''
  }

}
