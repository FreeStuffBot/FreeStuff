

export default class Const {

  public static readonly links = {
    website: 'https://freestuffbot.xyz/',
    websiteClean: 'freestuffbot.xyz',
    botInvite: 'https://discordapp.com/oauth2/authorize?redirect_uri=https%3A%2F%2Ffreestuffbot.xyz%2Fcallback&client_id=672822334641537041&permissions=445504&scope=bot&response_type=code',
    supportInvite: 'https://discord.gg/WrnKKF8',

    topgg: 'https://top.gg/bot/672822334641537041/vote',
    dbl: 'https://discord.ly/freestuff',
    dlabs: 'https://bots.discordlabs.org/bot/672822334641537041',

    team: 'https://freestuffbot.xyz/team',
    privacy: 'https://freestuffbot.xyz/privacy',
    terms: 'https://freestuffbot.xyz/terms',
    testgame: 'https://freestuffbot.xyz/testgame',
    themes: 'https://freestuffbot.xyz/themes',
  }

  public static readonly themesWithEmbeds = [ 0, 1, 2, 3, 4, 5 ];
  public static readonly themesWithExtemotes = { 0: 1, 2: 3 };
  
  // TODO disabled because discord sucks :(
  // public static readonly announcementButton = '<:b1:672825613467385857><:b2:672825613500809261><:b3:672825613580501031><:b4:672825613450477579>\n<:b5:672825613513654322><:b6:672825613513392138><:b7:672825613215727645><:b8:672825613157138435>';
  public static readonly announcementButton = '**GET**';

  public static readonly storeEmojis = {
    steam: '<:store_steam:700096501728411739>',
    epic: '<:store_epic:700094298984808468>',
    humble: '<:store_humble:700096326133743759>',
    gog: '<:store_gog:700096328151072800>',
    origin: '<:store_origin:700096326196658178>',
    uplay: '<:store_uplay:700098098080251924>',
    twitch: '<:store_twitch:700098446333313126>',
    itch: '<:store_itch:700097690431651921>',
    discord: '<:store_discord:700097689139937320>',
    apple: '<:store_apple:700097690653949952>',
    google: '<:store_google:700097689194594305>',
    switch: '<:store_switch:700097951032147988>',
    ps: ':grey_question:',
    xbox: ':grey_question:',
    other: ':grey_question:'
  };

  public static readonly storeIcons = {
    steam: 'https://cdn.discordapp.com/emojis/700096501728411739.png?v=1',
    epic: 'https://cdn.discordapp.com/emojis/700094298984808468.png?v=1',
    humble: 'https://cdn.discordapp.com/emojis/700096326133743759.png?v=1',
    gog: 'https://cdn.discordapp.com/emojis/700096328151072800.png?v=1',
    origin: 'https://cdn.discordapp.com/emojis/700096326196658178.png?v=1',
    uplay: 'https://cdn.discordapp.com/emojis/700098098080251924.png?v=1',
    twitch: 'https://cdn.discordapp.com/emojis/700098446333313126.png?v=1',
    itch: 'https://cdn.discordapp.com/emojis/700097690431651921.png?v=1',
    discord: 'https://cdn.discordapp.com/emojis/700097689139937320.png?v=1',
    apple: 'https://cdn.discordapp.com/emojis/700097690653949952.png?v=1',
    google: 'https://cdn.discordapp.com/emojis/700097689194594305.png?v=1',
    switch: 'https://cdn.discordapp.com/emojis/700097951032147988.png?v=1',
    ps: '',
    xbox: '',
    other: ''
  };

  public static readonly bigSpace = '<:nothing:716252611962994718>';

}