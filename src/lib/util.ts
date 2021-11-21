import { Long } from 'mongodb'
import { Core } from '../index'


export class Util {

  public static belongsToShard(id: Long, shard?: number) {
    if (Core.options.shardCount === 1) return true
    const mod = id
      .shiftRight(22)
      .modulo(Long.fromNumber(Core.options.shardCount))

    if (shard === undefined) {
      for (const shard of Core.options.shards as number[]) {
        if (mod.equals(Long.fromNumber(shard)))
          return true
      }
      return false
    }

    return mod.equals(Long.fromNumber(shard))
  }

  /** @deprecated use fsb/common util */
  public static modifyBits(input: number, lshift: number, bits: number, value: number): number {
    return (input & ~((2 ** bits - 1) << lshift)) | (value << lshift)
  }

  /** @deprecated use fsb/common util */
  public static generateWord(alphabet: string, length: number): string {
    let out = ''
    while (length-- > 0)
      out += alphabet[~~(Math.random() * alphabet.length)]
    return out
  }

}
