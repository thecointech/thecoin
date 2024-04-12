import * as Src from '.';

const genRanHex = (size: number) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
export class UberConverter implements Pick<Src.UberConverter, 'processPending'> {

  address = "0xC000000000000000000000000000000000000000";
  // "0xC0"
  // prefix is (c) for sending to the coin
  genReceipt = (prefix: string = '0') => {
    return Promise.resolve({
      wait: () => { },
      hash: `0x${prefix}${genRanHex(63)}`,
    } as any)
  }

  processPending = () => this.genReceipt('c');
}

export const getContract: typeof Src.getContract = () => new UberConverter() as any;
export const connectConverter: typeof Src.connectConverter = () => new UberConverter() as any;
