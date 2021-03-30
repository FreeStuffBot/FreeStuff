import { Core } from "../index";
import { Long } from "mongodb";


export class Util {

  private constructor() { }

  //

  public static init() {
  }

  public static belongsToShard(id: Long) {
    if (Core.singleShard) return true;
    return id
      .shiftRight(22)
      .modulo(Long.fromNumber(Core.options.shardCount))
      .equals(Long.fromNumber(Core.options.shards[0]));
  }
  
  public static modifyBits(input: number, lshift: number, bits: number, value: number): number {
    return (input & ~((2 ** bits - 1) << lshift)) | (value << lshift);
  }

}
