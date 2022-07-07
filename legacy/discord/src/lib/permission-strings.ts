import { Permissions } from 'discord.js'


export default class PermissionStrings {

  public static readonly BIT: Record<keyof typeof Permissions.FLAGS, bigint> = Object
    .keys(Permissions.FLAGS)
    .map(k => ([ k, BigInt(Permissions.FLAGS[k]) ] as [string, bigint]))
    .reduce((c, o) => ({ ...c, [o[0]]: o[1] }), {}) as any

  public static permissionStringContains(string: string | bigint, per: number | bigint) {
    if (typeof string !== 'bigint')
      string = BigInt(string)
    if (typeof per !== 'bigint')
      per = BigInt(per)
    return (string & per) !== 0n
  }

  //

  public static containsAdmin(string: string | bigint) {
    return PermissionStrings.permissionStringContains(string, PermissionStrings.BIT.ADMINISTRATOR)
  }

  public static containsManageServer(string: string | bigint) {
    return PermissionStrings.permissionStringContains(string, PermissionStrings.BIT.MANAGE_GUILD)
      || PermissionStrings.containsAdmin(string)
  }

  public static containsManageMessages(string: string | bigint) {
    return PermissionStrings.permissionStringContains(string, PermissionStrings.BIT.MANAGE_MESSAGES)
      || PermissionStrings.containsAdmin(string)
  }

}
