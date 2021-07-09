
export default class Emojis {

  private static readonly regionalIndicators = '🇦,🇧,🇨,🇩,🇪,🇫,🇬,🇭,🇮,🇯,🇰,🇱,🇲,🇳,🇴,🇵,🇶,🇷,🇸,🇹,🇺,🇻,🇼,🇽,🇾,🇿'.split(',')

  public readonly string

  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly animated: boolean = false,
    string?: string
  ) {
    this.string = string || `<${this.animated ? 'a' : ''}:${this.name}:${this.id}>`
  }

  toString(): string {
    return this.string
  }

  //

  public static fromFlagName(name: string): Emojis {
    const char = name
      .split(':')
      .join('')
      .split('_')[1]
      .toLowerCase()
      .split('')
      .reduce((str, char) => (str + Emojis.regionalIndicators[char.charCodeAt(0) - 97]), '')
    return new Emojis(null, name, false, char)
  }

  //

  public static readonly bigSpace = new Emojis('716252611962994718', 'nothing')
  public static readonly mention = new Emojis('863103982603075634', 'mention')
  public static readonly channel = new Emojis('863103982120992769', 'channel')
  public static readonly overflow = new Emojis('863142285465485372', 'overflow')

}
