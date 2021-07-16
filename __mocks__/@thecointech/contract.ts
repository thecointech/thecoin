
import { TheCoin as SrcTheCoin } from '@thecointech/contract';
import { utils } from 'ethers'

const genRanHex = (size: number) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

export class TheCoin implements Pick<SrcTheCoin, 'coinPurchase'|'balanceOf'|'certifiedTransfer'>{

  coinPurchase = (_address: string, _amount: number) => Promise.resolve({
    wait: () => { },
    hash: `0x${genRanHex(64)}`,
  } as any)
  balanceOf = () => Promise.resolve(new utils.BigNumber(1000000000));
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

export function GetContract() : Promise<TheCoin> {
  return Promise.resolve(new TheCoin() as any);
}

export function ConnectContract() : Promise<TheCoin> {
  return Promise.resolve(new TheCoin() as any);
}
