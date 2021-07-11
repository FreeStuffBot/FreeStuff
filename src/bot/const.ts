import { Currency, PriceClass, Platform, Theme } from '../types/context'
import ThemeOne from './themes/1'
import ThemeTwo from './themes/2'
import ThemeThree from './themes/3'
import ThemeFour from './themes/4'
import ThemeFive from './themes/5'
import ThemeSix from './themes/6'
import ThemeSeven from './themes/7'
import ThemeEight from './themes/8'
import ThemeNine from './themes/9'
import ThemeTen from './themes/10'
import Emojis from './emojis'

export default class Const {

  public static readonly links = {
    website: 'https://freestuffbot.xyz/',
    websiteClean: 'freestuffbot.xyz',
    botInvite: 'https://discord.com/oauth2/authorize?redirect_uri=https%3A%2F%2Ffreestuffbot.xyz%2Fcallback&client_id=672822334641537041&permissions=445504&scope=bot%20applications.commands&response_type=code',
    supportInvite: 'https://discord.gg/WrnKKF8',

    topgg: 'https://top.gg/bot/672822334641537041/vote',
    dbl: 'https://discord.ly/freestuff',
    dlabs: 'https://bots.discordlabs.org/bot/672822334641537041',

    team: 'https://freestuffbot.xyz/team',
    privacy: 'https://freestuffbot.xyz/privacy',
    terms: 'https://freestuffbot.xyz/terms',
    testgame: 'https://freestuffbot.xyz/testgame',
    themes: 'https://freestuffbot.xyz/themes'
  }

  public static readonly themesWithEmbeds = [ 0, 1, 2, 3, 4, 5 ];
  public static readonly themesWithExtemotes = { 0: 1, 2: 3 };

  public static readonly embedDefaultColor = 0x2F3136

  public static readonly storeIcons = {
    steam: 'https://media.discordapp.net/attachments/672907465670787083/820258285566820402/steam.png',
    epic: 'https://cdn.discordapp.com/attachments/672907465670787083/820258283293638676/epic.png',
    humble: 'https://cdn.discordapp.com/attachments/672907465670787083/820258291862601728/humble.png',
    gog: 'https://cdn.discordapp.com/attachments/672907465670787083/820258294735962152/gog.png',
    origin: 'https://cdn.discordapp.com/attachments/672907465670787083/820258290063769600/origin.png',
    uplay: 'https://cdn.discordapp.com/attachments/672907465670787083/820258286816854046/ubi.png',
    twitch: 'https://cdn.discordapp.com/attachments/672907465670787083/820258287337472010/twitch.png',
    itch: 'https://cdn.discordapp.com/attachments/672907465670787083/820258293410299924/itch.png',
    discord: 'https://cdn.discordapp.com/attachments/672907465670787083/820258296149704714/discord.png',
    apple: 'https://cdn.discordapp.com/emojis/700097690653949952.png?v=1',
    google: 'https://cdn.discordapp.com/emojis/700097689194594305.png?v=1',
    switch: 'https://cdn.discordapp.com/attachments/672907465670787083/820258288938647592/switch.png',
    ps: '',
    xbox: '',
    other: ''
  }

  public static readonly storeIconsExt = {
    ...Const.storeIcons,
    steam: 'https://media.discordapp.net/attachments/672907465670787083/833646821611798538/steam_ext.png',
    epic: 'https://media.discordapp.net/attachments/672907465670787083/833646813172465734/epic_ext.png',
    humble: 'https://media.discordapp.net/attachments/672907465670787083/833652544252674068/humble_ext.png',
    gog: 'https://media.discordapp.net/attachments/672907465670787083/833652542113185823/gog_ext.png',
    origin: 'https://media.discordapp.net/attachments/672907465670787083/833652533431500850/origin_ext.png',
    uplay: 'https://media.discordapp.net/attachments/672907465670787083/833652539286093834/ubi_ext.png',
    twitch: 'https://media.discordapp.net/attachments/672907465670787083/833652537063768104/twitch_ext.png',
    itch: 'https://media.discordapp.net/attachments/672907465670787083/833652545867087872/itch_ext.png',
    discord: 'https://media.discordapp.net/attachments/672907465670787083/833652540641247262/discord_ext.png',
    switch: 'https://media.discordapp.net/attachments/672907465670787083/833652535356817418/switch_ext.png'
  }

  public static readonly themes: Theme[] = [
    {
      id: 0,
      name: '=theme_one_name',
      description: '=theme_one_desc',
      emoji: '1️⃣',
      builder: new ThemeOne()
    },
    {
      id: 1,
      name: '=theme_two_name',
      description: '=theme_two_desc',
      emoji: '2️⃣',
      builder: new ThemeTwo()
    },
    {
      id: 2,
      name: '=theme_three_name',
      description: '=theme_three_desc',
      emoji: '3️⃣',
      builder: new ThemeThree()
    },
    {
      id: 3,
      name: '=theme_four_name',
      description: '=theme_four_desc',
      emoji: '4️⃣',
      builder: new ThemeFour()
    },
    {
      id: 4,
      name: '=theme_five_name',
      description: '=theme_five_desc',
      emoji: '5️⃣',
      builder: new ThemeFive()
    },
    {
      id: 5,
      name: '=theme_six_name',
      description: '=theme_six_desc',
      emoji: '6️⃣',
      builder: new ThemeSix()
    },
    {
      id: 6,
      name: '=theme_seven_name',
      description: '=theme_seven_desc',
      emoji: '7️⃣',
      builder: new ThemeSeven()
    },
    {
      id: 7,
      name: '=theme_eight_name',
      description: '=theme_eight_desc',
      emoji: '8️⃣',
      builder: new ThemeEight()
    },
    {
      id: 8,
      name: '=theme_nine_name',
      description: '=theme_nine_desc',
      emoji: '9️⃣',
      builder: new ThemeNine()
    },
    {
      id: 9,
      name: '=theme_ten_name',
      description: '=theme_ten_desc',
      emoji: '🔟',
      builder: new ThemeTen()
    }
  ]

  public static readonly defaultTheme = Const.themes[0]

  public static readonly currencies: Currency[] = [
    {
      id: 0,
      name: 'Euro',
      symbol: '€',
      calculated: false
    },
    {
      id: 1,
      name: 'USD',
      symbol: '$',
      calculated: false
    }
  ]

  public static readonly defaultCurrency = Const.currencies[0]

  public static readonly priceClasses: PriceClass[] = [
    {
      id: 0,
      from: 0,
      name: 'Everything'
    },
    {
      id: 1,
      from: 1,
      name: 'Almost Everything'
    },
    {
      id: 2,
      from: 3,
      name: 'Default'
    },
    {
      id: 3,
      from: 10,
      name: 'Big fish'
    }
  ]

  public static readonly defaultPriceClass = Const.priceClasses[2]

  public static readonly platforms: Platform[] = [
    {
      id: 'other',
      bit: 1 << 0,
      name: '=platform_other',
      description: 'Less popular platforms or publisher websites',
      emoji: Emojis.store.other,
      default: false
    },
    {
      id: 'steam',
      bit: 1 << 1,
      name: '=platform_steam',
      description: 'https://store.steampowered.com/',
      emoji: Emojis.store.steam,
      default: true
    },
    {
      id: 'epic',
      bit: 1 << 2,
      name: '=platform_epic',
      description: 'https://www.epicgames.com/store/',
      emoji: Emojis.store.epic,
      default: true
    },
    {
      id: 'humble',
      bit: 1 << 3,
      name: '=platform_humble',
      description: 'https://www.humblebundle.com/',
      emoji: Emojis.store.humble,
      default: true
    },
    {
      id: 'gog',
      bit: 1 << 4,
      name: '=platform_gog',
      description: 'https://www.gog.com/',
      emoji: Emojis.store.gog,
      default: true
    },
    {
      id: 'origin',
      bit: 1 << 5,
      name: '=platform_origin',
      description: 'https://www.origin.com/store',
      emoji: Emojis.store.origin,
      default: true
    },
    {
      id: 'uplay',
      bit: 1 << 6,
      name: '=platform_uplay',
      description: 'https://store.ubi.com/',
      emoji: Emojis.store.uplay,
      default: true
    },
    {
      id: 'itch',
      bit: 1 << 7,
      name: '=platform_itch',
      description: 'https://itch.io/',
      emoji: Emojis.store.itch,
      default: true
    }
  ]

  public static readonly defaultPlatforms = Const.platforms
    .filter(p => p.default)
    .reduce((val, p) => (val ^= p.bit), 0)

}
