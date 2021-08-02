
import * as Src from  '.';
import { BigNumber } from 'ethers'

const genRanHex = (size: number) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

export class TheCoin implements Pick<Src.TheCoin, 'coinPurchase'|'balanceOf'|'certifiedTransfer'>{

  coinPurchase = (_address: string, _amount: number) => Promise.resolve({
    wait: () => { },
    hash: `0x${genRanHex(64)}`,
  } as any)
  balanceOf = () => Promise.resolve(BigNumber.from(1000000000));
  certifiedTransfer = () => Promise.resolve({
    confirmations: 1,
    hash: `0x${genRanHex(64)}`,
  } as any)

  provider = {
    waitForTransaction: () => Promise.resolve({}),
    getLogs: () => Promise.resolve([]),
    getBlockNumber: () => Promise.resolve(12345),
  }
  estimate = {
    certifiedTransfer: () => Promise.resolve(1000)
  }
  filters = {
    Transfer: () => () => {}
  }
}

export const GetContract : typeof Src.GetContract = () => new TheCoin() as any;
export const ConnectContract : typeof Src.ConnectContract = () => new TheCoin() as any;
