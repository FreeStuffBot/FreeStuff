
export default class Util {

  public static modifyBits(input: number, lshift: number, bits: number, value: number): number {
    return (input & ~((2 ** bits - 1) << lshift)) | (value << lshift)
  }

  public static generateWord(alphabet: string, length: number): string {
    let out = ''
    while (length-- > 0)
      out += alphabet[~~(Math.random() * alphabet.length)]
    return out
  }

}
