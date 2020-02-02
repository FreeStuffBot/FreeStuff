/**
 * @author Maanex (maanex.tk)
 */

export default class ParseArgs {

    private constructor (
    ) {}

    public static parse(input: string[] | string): { [key: string]: string | boolean } {
        if (typeof input == 'string')
            input = input.split(' ');

        let currentFlag = '_';
        let out = { };

        for (let token of input) {
            if (token.charAt(0) == '-') {
                if (token.charAt(1) == '-') {
                    if (!out[currentFlag] && currentFlag != '_')
                        out[currentFlag] = true;
                    currentFlag = token.substring(2);
                    continue;
                }
                for (let digit of token.substring(1).split('')) {
                    out[digit] = true;
                    currentFlag = digit;
                }
                continue;
            }
            if (out[currentFlag] && typeof out[currentFlag] == 'string') out[currentFlag] += ' ' + token;
            else out[currentFlag] = token;
        }
        if (!out[currentFlag] && currentFlag != '_')
            out[currentFlag] = true;

        return out;
    }

}