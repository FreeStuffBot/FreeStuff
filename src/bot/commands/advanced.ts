import { Message } from "discord.js";
import { ReplyFunction, Command, GuildData } from "../../types";
import Const from "../const";
import { Core } from "../../index";


export default class AdvancedCommand extends Command {

  private readonly raw = [
    [ 'check', '=cmd_check_desc' ],
    [ 'resend', '=cmd_resend_desc' ],
    [ 'mydata', '=cmd_mydata_desc' ],
    [ 'reset', '=cmd_reset_desc' ],
  ]

  public constructor() {
    super({
      name: 'advanced',
      desc: '=cmd_advanced_desc',
      trigger: [ 'advanced' ]
    });
  }

  public handle(mes: Message, args: string[], g: GuildData, repl: ReplyFunction): boolean {
    const commands = this.raw.map(c => `• \`@${mes.guild.me.user.username} ${c[0]}\` ─ ${Core.text(g, c[1])}`);

    repl(
      Core.text(g, '=cmd_advanced_1'),
      [
        Core.text(g, '=cmd_advanced_2'),
        commands.join('\n\n'), Core.text(g, '=cmd_advanced_bottom_text', { privacy: Const.links.privacy, terms: Const.links.terms })
      ].join('\n\n'),
    );
    return true;
  }

}