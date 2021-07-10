import { Store } from 'freestuff'

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

  public static readonly store: { [store in Store]: Emojis } = {
    steam: new Emojis('820258442303242320', 'steam'),
    epic: new Emojis('820258440512798731', 'epic'),
    humble: new Emojis('820258441217966120', 'humble'),
    gog: new Emojis('820258440488026113', 'gog'),
    origin: new Emojis('820258441725476914', 'origin'),
    uplay: new Emojis('820258441704505354', 'ubi'),
    twitch: new Emojis('820258440882028544', 'twitch'),
    itch: new Emojis('820258441557442600', 'itch'),
    discord: new Emojis('820258441503309824', 'discord'),
    apple: new Emojis('700097690653949952', 'store_apple'),
    google: new Emojis('700097689194594305', 'store_google'),
    switch: new Emojis('820258441225699338', 'switch'),
    ps: new Emojis('❔', '', false, '❔'),
    xbox: new Emojis('❔', '', false, '❔'),
    other: new Emojis('❔', '', false, '❔')
  }

}
