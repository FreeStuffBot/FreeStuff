import { Message } from "discord.js";
import { ReplyFunction, Command } from "../../types";
import { Core } from "../../index";
import Const from "../const";


export default class TestCommand extends Command {

  private readonly thumbsUpImages = [
    // 'https://cdn.discordapp.com/attachments/672907465670787083/673119991649796106/unknown.png',
    // 'https://media.discordapp.net/attachments/672907465670787083/693591561262465124/fetchimage.png',
    // 'https://media.discordapp.net/attachments/672907465670787083/693591793479975013/1562325563_hidethepainharold_promotions.png',
    // 'https://media.discordapp.net/attachments/672907465670787083/693592156530540595/106479_Medium.png',
    // 'https://media.discordapp.net/attachments/672907465670787083/693592862763515914/23silg.png?width=1204&height=677',
    'https://media.discordapp.net/attachments/672907465670787083/710466653380411462/thumbnail_placeholder.png'
  ];

  private testCooldown = [ ];
  private testCooldownHarsh = [ ];

  public constructor() {
    super({
      name: 'test',
      desc: 'Run a test announcement to see if you\'ve set up everything correctly. Requires you to have the __Manage Server__ permission.',
      trigger: [ 'test' ],
      serverManagerOnly: true
    });
  }

  public handle(mes: Message, args: string[], repl: ReplyFunction): boolean {
    if (this.testCooldownHarsh.includes(mes.guild.id))
      return true;
    if (this.testCooldown.includes(mes.guild.id)) {
      repl('Command is on cooldown!', 'This command has a 10 second cooldown, please wait a bit!');
      this.testCooldownHarsh.push(mes.guild.id);
      return true;
    }
    Core.databaseManager.getGuildData(mes.guild).then(d => {
      if (!d) {
        Core.databaseManager.addGuild(mes.guild);
        repl('A wild error occurred!', `Can you please try that again? If this message keeps appearing please wait a bit or [reach out to our support team](${Const.discordInvite}), thanks.`)
        return;
      }
      if (!d.channelInstance) {
        repl('Whoops!', `I'd love to but I don't know where you'd like to have the news!\nDo \`@FreeStuff set channel #${mes.guild.channels.filter(c => c.type == 'text').random().name}\` to tell me where to annouce free games!`);
        return true;
      }
      if (!d.channelInstance.guild.me.permissionsIn(d.channelInstance).has('READ_MESSAGES')) {
        repl('Whoops!', `Looks like I don't have the permission to see the channel ${d.channelInstance}!`);
        return true;
      }
      if (!d.channelInstance.guild.me.permissionsIn(d.channelInstance).has('SEND_MESSAGES')) {
        repl('Whoops!', `Looks like I don't have the permission to send messages in ${d.channelInstance}!`);
        return true;
      }
      if (!d.channelInstance.guild.me.permissionsIn(d.channelInstance).has('EMBED_LINKS')
          && Const.themesWithEmbeds.includes(d.theme)) {
          repl('Oh well...', `The theme you're using uses embeds to make the message look nicer... now the thing is, I don't have the permission to send embeds in ${d.channelInstance}! Either give me the permission \`Embed Links\` or choose a different theme that doesn't use embeds!`);
        return true;
      }
      if (!d.channelInstance.guild.me.permissionsIn(d.channelInstance).has('EXTERNAL_EMOJIS')
          && Const.themesWithExtemotes[d.theme]) {
          repl('Oh well...', `The theme you're using uses external emojis to create the big button. Now you either have to give me the \`Use External Emojis\` permission or tell me to use another theme which doesn't use external emojis!`);
        return true;
      }
      Core.messageDistributor.test(mes.guild, {
        title: 'Game name here',
        org_price: {
          euro: 19.99,
          dollar: 19.99
        },
        price: {
          euro: 0,
          dollar: 0
        },
        store: 'steam',
        thumbnail: this.thumbsUpImages[Math.floor(Math.random() * this.thumbsUpImages.length)],
        org_url: Const.testGameLink,
        url: Const.testGameLink,
        flags: [],
        steamSubids: '',
        until: -1,
        type: 'free'
      });
    }).catch(err => {
      repl('An error occured!', 'We\'re trying to fix this issue as soon as possible!');
      console.log(err);
    });
    this.testCooldown.push(mes.guild.id);
    setTimeout(() => {
      this.testCooldown.splice(this.testCooldown.indexOf(mes.guild.id), 1);
      this.testCooldownHarsh.splice(this.testCooldownHarsh.indexOf(mes.guild.id), 1);
    }, 10_000);
    return true;
  }

}