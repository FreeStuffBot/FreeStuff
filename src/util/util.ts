

declare global {
    interface Array<T> {
        stack(): number;
        count(counter: (item: T) => number): number;
        iterate(run: (item: T, current: T | undefined) => any): any;
    }
}


export class Util {
    
    private constructor() {}

    public static init() {
        Object.defineProperties(Array.prototype, {
            stack: {
                value: function(): number {
                    let out = 0;
                    this.forEach(e => out += e);
                    return out;
                }
            },
            count: {
                value: function(counter: (item: any) => number): number {
                    let out = 0;
                    this.forEach(e => out += counter(e));
                    return out;
                }
            },
            iterate: {
                value: function(run: (item: any, current: any) => any): any {
                    let out = undefined;
                    this.forEach(e => out = run(e, out));
                    return out;
                }
            }
        });
    }

}


export let rand = max => Math.floor(Math.random() * max);