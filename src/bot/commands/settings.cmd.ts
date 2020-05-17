import { Message, TextChannel } from "discord.js";
import { ReplyFunction, GuildData, Command } from "../../types";
import { Core } from "../../index";
import Const from "../const";


export default class SettingsCommand extends Command {

  public constructor() {
    super({
      name: 'settings',
      desc: 'Change some server settings. Requires you to have the __Manage Server__ permission.',
      trigger: [ 'set', 'settings', 'config', 'configure', 'change' ],
      serverManagerOnly: true
    });
  }

  public handle(mes: Message, args: string[], repl: ReplyFunction): boolean {
    Core.databaseManager.getGuildData(mes.guild).then(guilddata => {
      if (!guilddata) {
        repl('An error occured!', 'Try removing the bot from your server and adding it back in. If this does not help, join the support server please (@FreeStuff about)!');
        return;
      }

      if (args.length < 1) {
        // Ewww, someone clean this up please lol
        const c = '@FreeStuff set';
        mes.channel.send({ embed: {
          title: 'Missing arguments!',
          description: 'Use the `@FreeStuff test` command to test if everything is working correctly!',
          footer: { text: `@${mes.author.tag}` },
          color: 0x2f3136,
          fields: [
            '`' + c + ' channel #' + ((guilddata && guilddata.channelInstance) ? guilddata.channelInstance.name : 'channel') + '` change the channel the bot will announce stuff in!',
            '`' + c + ' mention @' + ((guilddata && guilddata.roleInstance) ? guilddata.roleInstance.name : 'role') + '` let the bot mention a certain role. Useful for self-roles etc.',
            '`' + c + ' mention` to not let the bot mention anyone. The bot won\'t mention anyone by default!',
            '`' + c + ' theme ' + (guilddata ? (guilddata.theme + 1) : 1) + '` change the theme in which the bot will display the annoucement. See all available themes [here](' + Const.themeListLink + ')',
            '`' + c + ' currency ' + (guilddata ? (guilddata.currency == 'euro' ? '€' : '$') : '€') + '` to change the currency displayed in the announcement. You can use € or $.',
            '`' + c + ' reaction ' + (guilddata ? (guilddata.react ? 'on' : 'off') : 'off') + '` toggle auto reaction on or off. This will make the bot react with the :free: emoji on every new annoucement.',
            '`' + c + ' trash ' + (guilddata ? (guilddata.trashGames ? 'on' : 'off') : 'off') + '` toggle weather you want to get notified about games with really bad rating or low quality.',
            '`' + c + ' minimum price ' + (guilddata ? guilddata.price : '3') + '` set the minimum price a game had to have before it became free for it to be announced.',
          ].map(l => { return { name: l.split('` ')[0] + '`', value: l.split('` ')[1] }})
        }});
        return true;
      }

      switch (args[0].toLowerCase()) {
        case 'channel':
          this.subcmdChannel(mes, args, guilddata, repl);
          break;
          
        case 'mention':
        case 'role':
          this.subcmdMention(mes, args, guilddata, repl);
          break;
          
        case 'theme':
          this.subcmdTheme(mes, args, guilddata, repl);
          break;
          
        case 'currency':
          this.subcmdCurrency(mes, args, guilddata, repl);
          break;
          
        case 'react':
        case 'reaction':
          this.subcmdReact(mes, args, guilddata, repl);
          break;

        case 'trash':
        case 'bad':
        case 'garbage':
          this.subcmdTrash(mes, args, guilddata, repl);
          break;

        case 'minimum':
        case 'minimumprice':
        case 'min':
        case 'price':
        case 'cost':
          this.subcmdMinPrice(mes, args, guilddata, repl);
          break;

        default:
          repl(`Setting ${args[0]} not found!`, 'Type `@FreeStuff settings` for an overview over all available settings!');
          break;
      }
    })
    .catch(err => {
      repl('An error occured!', 'We\'re trying to fix this issue as soon as possible!');
      console.log(err);
    });

    return true;
  }

  private subcmdChannel(orgmes: Message, args: string[], guilddata: GuildData, reply: ReplyFunction) {
    if (args.length < 2) {
      reply('Sure, just tell me where!', `Example: \`@FreeStuff set channel #${orgmes.guild.channels.filter(c => c.type == 'text').random().name}\``);
      return;
    }
    let channel = orgmes.mentions.channels.first();
    if (!channel) {
      const result = isNaN(parseInt(args[1]))
        ? orgmes.guild.channels.find(find => find.name.toLowerCase() == args[1].toLowerCase())
        : orgmes.guild.channels.find(find => find.id == args[1]);
      if (!result) {
        reply(`I'm sorry,`, `but I just don't seem to find the channel \`${args[1]}\`!`);
        return;
      } else if (result.type != 'text' && result.type != 'news') {
        reply('Interesting choice of channel!', 'I would prefer a regular text channel though!');
        return;
      } else channel = result as TextChannel;
    }
    if (channel.type != 'text' && channel.type != 'news') {
      reply('Interesting choice of channel!', 'I would prefer a regular text channel though!');
    } else if (!channel.guild.me.permissionsIn(channel).has('VIEW_CHANNEL')) {
      reply('Oh no!', `The channel #${channel.name} is not visible to me! Please edit my permissions in this channel like so:`, undefined, undefined, 'https://media.discordapp.net/attachments/672907465670787083/690942039218454558/unknown.png');
    } else if (!channel.guild.me.permissionsIn(channel).has('SEND_MESSAGES')) {
      reply('I wish I could...', `... but I don't have the permission to do so! Please check my permissions in #${channel.name} and make sure I can send messages!`, undefined, undefined, 'https://media.discordapp.net/attachments/672907465670787083/690942039218454558/unknown.png');
    } else {
      Core.databaseManager.changeSetting(orgmes.guild, guilddata, 'channel', channel.id);
      reply('Alright!', 'From now on I will announce free games in ' + channel.toString());
    }
  }

  private subcmdMention(orgmes: Message, args: string[], guilddata: GuildData, reply: ReplyFunction) {
    if (args.length < 2) {
      if (guilddata.role) {
        Core.databaseManager.changeSetting(orgmes.guild, guilddata, 'roleMention', undefined);
        reply('As you wish!', 'I will now no longer ping any roles when games are free!');
      } else {
        reply('Nothing has changed!', `I'll continue not pinging anyone! If you actually do want me to ping someone when games are free, use \`@FreeStuff set mention @role\``);
      }
      return;
    }
    if (orgmes.mentions.everyone) {
      if (guilddata.channelInstance && !orgmes.guild.me.permissionsIn(guilddata.channelInstance).has('MENTION_EVERYONE')) {
        reply('Oh no!', `I don't have the permission to mention @everyone in ${guilddata.channelInstance.toString}!`);
        return;
      }
      Core.databaseManager.changeSetting(orgmes.guild, guilddata, 'roleMention', '1');
      reply('<:feelspingman:672921662987042867>', `@everyone it is!`);
      return;
    }
    if (!orgmes.mentions.roles.size) {
      reply('Oops!', `${args[1]} doesn't look like a role to me :thinking:`);
      return;
    }
    let role = orgmes.mentions.roles.first();
    if (!role) return;
    Core.databaseManager.changeSetting(orgmes.guild, guilddata, 'roleMention', role.id);
    reply('<:feelspingman:672921662987042867>', `I will now ping ${role} whenever there's free games to grab!`);
  }

  private subcmdTheme(orgmes: Message, args: string[], guilddata: GuildData, reply: ReplyFunction) {
    if (args.length < 2) {
      reply('Yes I can, just which one?', `If you want to change your current theme please use \`@FreeStuff set theme <theme>\`\nA full list of all available themes can be found [Here](${Const.themeListLink})`);
      return;
    }
    if (['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(args[1])) {
      Core.databaseManager.changeSetting(orgmes.guild, guilddata, 'theme', parseInt(args[1]) - 1);
      reply('Looking good!', 'New theme was applied successfully! Take a look with `@FreeStuff test`!');
    } else {
      reply('Oh no!', `Couldn't find the theme ${args[1]}!\n[Here's a full list of all the available themes!](${Const.themeListLink})`);
    }
  }

  private subcmdCurrency(orgmes: Message, args: string[], guilddata: GuildData, reply: ReplyFunction) {
    if (args.length < 2) {
      reply('Sure, just tell me which one!', 'To change the currency, please use `@FreeStuff set currency <currency>`, with <currency> being either € or $');
      return;
    }
    if (['€', 'euro', 'eur'].includes(args[1].toLowerCase())) {
      if (guilddata.currency != 'euro')
        Core.databaseManager.changeSetting(orgmes.guild, guilddata, 'currency', 0);
      reply('Euro it is!', 'Good choice!');
    } else if (['$', 'dollar', 'usd'].includes(args[1].toLowerCase())) {
      if (guilddata.currency != 'usd')
        Core.databaseManager.changeSetting(orgmes.guild, guilddata, 'currency', 1);
      reply('US-Dollar it is!', 'Good choice!');
    } else {
      reply(args[1] + 'is not a supported currency, sorry!', 'Please choose either `euro` or `usd`!');
    }
  }
  
  private subcmdReact(orgmes: Message, args: string[], guilddata: GuildData, reply: ReplyFunction) {
    if (args.length < 2) {
      reply(`I'm currently ${guilddata.react ? 'reacting to annoucements!' : 'not reacting to announcements!'}`, `To change that, use \`@FreeStuff set reaction ${guilddata.react ? 'off' : 'on'}\``);
      return;
    }
    if (['on', 'true', '1'].includes(args[1].toLowerCase())) {
      if (!guilddata.react)
        Core.databaseManager.changeSetting(orgmes.guild, guilddata, 'react', 1);
      reply('As you command!', 'I will now add a :free: reaction to every free game I announce!');
    } else if (['off', 'false', '0'].includes(args[1].toLowerCase())) {
      if (guilddata.react)
        Core.databaseManager.changeSetting(orgmes.guild, guilddata, 'react', 0);
      reply('Allright!', 'I\'ll stop doing that...');
    } else {
      reply('uhhhhh', `What's ${args[1]} supposed to mean? Please either go for on or for off, thanks!`);
    }
  }
  
  private subcmdTrash(orgmes: Message, args: string[], guilddata: GuildData, reply: ReplyFunction) {
    if (args.length < 2) {
      if (guilddata.trashGames) reply('I announce trash games in this server!', 'Don\'t want them anymore? `@FreeStuff set trash off` will be your saviour!');
      else reply('This server is save from trashy games!', 'I do my best to filter them out! If you want them, do a quick `@FreeStuff set trash on`');
      return;
    }
    if (['on', 'true', '1'].includes(args[1].toLowerCase())) {
      if (!guilddata.trashGames)
        Core.databaseManager.changeSetting(orgmes.guild, guilddata, 'trash', 1);
      reply('Wild!', 'Trashy games will now be announced!');
    } else if (['off', 'false', '0'].includes(args[1].toLowerCase())) {
      if (guilddata.trashGames)
        Core.databaseManager.changeSetting(orgmes.guild, guilddata, 'trash', 0);
      reply('Yeah I\'d do the same tbo!', 'No more trash games in this server!');
    } else {
      reply('YES OR NO? ☎️', `The connection here is really bad atm... I only understand ${args[1]}. What do you want trash games? Yes or no?`);
    }
  }

  private subcmdMinPrice(orgmes: Message, args: string[], guilddata: GuildData, reply: ReplyFunction) {
    if (args.length < 2) {
      const pricestr = guilddata.currency == 'euro'
        ? `${guilddata.price}€`
        : `$ ${guilddata.price}`;
      reply(`Currently, only games worth ${pricestr} or more get announced here!`, 'To change that, use `@FreeStuff set minimum price <something>`');
      return;
    }
    const clear = inp => inp.split('$').join('').split('€').join('');
    let price = parseFloat(clear(args[1]));
    if (isNaN(price) && args.length > 2) {
      price = parseFloat(clear(args[2]));
    }
    if (isNaN(price)) {
      reply(`${args.length == 2 ? args[1] : args[2]} is not a valid price!`, 'Here are some examples of how to use this properly\n`@FreeStuff set minimum price 3.99`n\n`@FreeStuff set minimum price $2`\n`@FreeStuff set price 5`');
      return;
    }
    price = ~~((price) * 100) / 100;
    const pricestr = guilddata.currency == 'euro'
      ? `${price}€`
      : `$ ${price}`;
    if (price < 0) {
      reply(`How? What? Why?`, `${pricestr} is a negative value. This doesn't make sense. Please choose 0 if you don't want any price restrictions or a valid positive number otherise!`);
    } else if (price > 100) {
      reply(`Let's not get ridiculous!`, `Which game that costs over ${pricestr} will ever be free? Choose something more reasonable please!`);
    } else {
      if (price == 69) reply(`Nice!`, `You'll only get the good stuff!`);
      else if (price == 0) reply(`As you wish, no price filter!`, `Now each and every game will be announced, no matter how expensive it is. Or better: was`);
      else reply(`Excellent choice ${orgmes.author.username}!`, `Every game cheaper than ${pricestr} will no longer make it to this server!`);
      Core.databaseManager.changeSetting(orgmes.guild, guilddata, 'price', price);
    }
  }
  
}