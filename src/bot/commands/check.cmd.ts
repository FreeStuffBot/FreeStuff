import { Message } from "discord.js";
import { ReplyFunction, Command } from "../../types";
import { Core } from "../../index";
import Const from "../const";


export default class CheckCommand extends Command {

  private checkCooldown = [ ];
  private checkCooldownHarsh = [ ];

  public constructor() {
    super({
      name: 'check',
      desc: 'Check if you\'ve set everything up correctly. Basically the same as the test command but without an announcement message. Requires you to have the __Manage Server__ permission.',
      trigger: [ 'check' ],
      serverManagerOnly: true
    });
  }

  public handle(mes: Message, args: string[], repl: ReplyFunction): boolean {
    if (this.checkCooldownHarsh.includes(mes.guild.id))
      return true;
    if (this.checkCooldown.includes(mes.guild.id)) {
      repl('Command is on cooldown!', 'This command has a 10 second cooldown, please wait a bit!');
      this.checkCooldownHarsh.push(mes.guild.id);
      return true;
    }
    Core.databaseManager.getGuildData(mes.guild).then(d => {
      if (!d) {
        Core.databaseManager.addGuild(mes.guild);
        repl('A wild error occurred!', `Can you please try that again? If this message keeps appearing please wait a bit or [reach out to our support team](${Const.discordInvite}), thanks.`)
        return;
      }
      if (!d.channelInstance) {
        repl(':x:', `I don't know where to post the announcements!\nDo \`@FreeStuff set channel #${mes.guild.channels.filter(c => c.type == 'text').random().name}\``);
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
      repl('Looks good on my end!', 'If you wanna make 100% sure that it all works like you want, do a quick `@FreeStuff test`. Otherwise we\'re done here, enjoy the free games!');
      return true;
    }).catch(err => {
      repl('An error occured!', 'We\'re trying to fix this issue as soon as possible!');
      console.log(err);
    });
    this.checkCooldown.push(mes.guild.id);
    setTimeout(() => {
      this.checkCooldown.splice(this.checkCooldown.indexOf(mes.guild.id), 1);
      this.checkCooldownHarsh.splice(this.checkCooldownHarsh.indexOf(mes.guild.id), 1);
    }, 10_000);
    return true;
  }

}