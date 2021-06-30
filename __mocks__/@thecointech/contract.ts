
import { TheCoin } from '@thecointech/contract';
import { utils } from 'ethers'

const genRanHex = (size: number) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

export class Contract {

  coinPurchase = (_address: string, _amount: number) => ({
    wait: () => { },
    hash: `0x${genRanHex(64)}`,
  })
  balanceOf = () => Promise.resolve(new utils.BigNumber(1000000000));
  certifiedTransfer = () => Promise.resolve({
    confirmations: 1,
    hash: `0x${genRanHex(64)}`,
  })

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

export function GetContract() : TheCoin {
  return new Contract() as unknown as TheCoin;
}

export function ConnectContract() : TheCoin {
  return new Contract() as unknown as TheCoin;
}
