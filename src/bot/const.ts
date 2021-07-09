

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

  public static readonly storeEmojis = {
    steam: '<:steam:820258442303242320>',
    epic: '<:epic:820258440512798731>',
    humble: '<:humble:820258441217966120>',
    gog: '<:gog:820258440488026113>',
    origin: '<:origin:820258441725476914>',
    uplay: '<:ubi:820258441704505354>',
    twitch: '<:twitch:820258440882028544>',
    itch: '<:itch:820258441557442600>',
    discord: '<:discord:820258441503309824>',
    apple: '<:store_apple:700097690653949952>',
    google: '<:store_google:700097689194594305>',
    switch: '<:switch:820258441225699338>',
    ps: ':grey_question:',
    xbox: ':grey_question:',
    other: ':grey_question:'
  };

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
  };

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
  };

}
