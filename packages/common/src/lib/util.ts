
export default class Util {

  public static modifyBits(input: number, lshift: number, bits: number, value: number): number {
    const mask = (2 ** bits - 1)    
    return (input & ~(mask << lshift)) | ((value & mask) << lshift)
  }

  public static modifyBitsMask(input: number, lshift: number, mask: number, value: number): number {    
    return (input & ~(mask << lshift)) | ((value & mask) << lshift)
  }

  public static generateWord(alphabet: string, length: number): string {
    let out = ''
    while (length-- > 0)
      out += alphabet[~~(Math.random() * alphabet.length)]
    return out
  }

}
