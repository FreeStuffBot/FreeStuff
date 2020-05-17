import { Core } from "../index";
import { Long } from "mongodb";



export class Util {

  private constructor() { }

  //

  public static init() {
    Object.defineProperties(Array.prototype, {
      stack: {
        value: function (): number {
          let out = 0;
          this.forEach(e => out += e);
          return out;
        }
      },
      count: {
        value: function (counter: (item: any) => number): number {
          let out = 0;
          this.forEach(e => out += counter(e));
          return out;
        }
      },
      iterate: {
        value: function (run: (item: any, current: any) => any): any {
          let out = undefined;
          this.forEach(e => out = run(e, out));
          return out;
        }
      }
    });
  }

  public static belongsToShard(id: Long) {
    if (Core.singleShard) return true;
    return id
      .shiftRight(22)
      .modulo(Long.fromNumber(Core.options.shardCount))
      .equals(Long.fromNumber(Core.options.shardId));
  }

}
