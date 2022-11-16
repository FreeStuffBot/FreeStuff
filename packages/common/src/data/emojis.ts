

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

  toObject(): ({ name: string } | { id: string }) {
    if (this.id) return { id: this.id }
    else return { name: this.name }
  }

  toString(): string {
    return this.string
  }

  //

  public static fromString(string: string): Emojis {
    if (!string) return null
    const inner = string.match(/<(.*?)>/)?.[1]
    if (!inner) return null
    const [ animated, name, id ] = inner.split(':')
    if (!id) return null
    return new Emojis(id, name, !!animated, string)
  }

  public static fromFlagName(name: string): Emojis {
    const char = name
      .split(':')
      .join('')
      .split('_')[1]
      .toLowerCase()
      .split('')
      .reduce((str, char) => (str + (Emojis.regionalIndicators[char.charCodeAt(0) - 97] || '')), '')
    return new Emojis(null, name, false, char)
  }

  //

  public static readonly bigSpace = new Emojis('716252611962994718', 'nothing')
  public static readonly caretLeft = new Emojis('863506003751337996', 'caret_left')
  public static readonly close = new Emojis('985130436395159562', 'close')
  public static readonly amogus = new Emojis('882222064625385552', 'amogus')

  public static readonly mention = new Emojis('863103982603075634', 'mention')
  public static readonly mentionGreen = new Emojis('863736579342991370', 'mention_green')
  public static readonly channel = new Emojis('863103982120992769', 'channel')
  public static readonly channelGreen = new Emojis('863736579335913483', 'channel_green')
  public static readonly announcementChannel = new Emojis('863732741752487946', 'announcement_channel')
  public static readonly announcementChannelGreen = new Emojis('863742472790474812', 'announcement_channel_green')
  public static readonly channelThreads = new Emojis('1042545315493990411', 'channel_threads')
  public static readonly channelThreadsGreen = new Emojis('1042545314537685054', 'channel_threads_green')
  public static readonly overflow = new Emojis('863142285465485372', 'overflow')
  public static readonly support = new Emojis('870412781827002418', 'support')
  public static readonly settings = new Emojis('870412781780869150', 'settings')
  public static readonly bot = new Emojis('870418849739198465', 'bot')

  public static readonly toggleOff = new Emojis('1041753384547524699', 'toggleOff')
  public static readonly toggleOn = new Emojis('1041753386023927958', 'toggleOn')

  public static readonly global = new Emojis('863734030280032256', 'global')
  public static readonly no = new Emojis('863734030457372692', 'no')

  public static readonly unknownPlatform = new Emojis('', '❔', false, '❔')

  // public static readonly store: Record<string, Emojis> = {
  //   steam: new Emojis('820258442303242320', 'steam'),
  //   epic: new Emojis('820258440512798731', 'epic'),
  //   humble: new Emojis('820258441217966120', 'humble'),
  //   gog: new Emojis('820258440488026113', 'gog'),
  //   origin: new Emojis('820258441725476914', 'origin'),
  //   uplay: new Emojis('820258441704505354', 'ubi'),
  //   twitch: new Emojis('820258440882028544', 'twitch'),
  //   itch: new Emojis('820258441557442600', 'itch'),
  //   discord: new Emojis('820258441503309824', 'discord'),
  //   apple: new Emojis('700097690653949952', 'store_apple'),
  //   google: new Emojis('700097689194594305', 'store_google'),
  //   switch: new Emojis('820258441225699338', 'switch'),
  //   ps: new Emojis('', '❔', false, '❔'),
  //   xbox: new Emojis('', '❔', false, '❔'),
  //   other: new Emojis('', '❔', false, '❔')
  // }

}
