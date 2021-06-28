
const genRanHex = (size: number) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
import { BigNumber } from 'ethers/utils'

export class Contract {

  coinPurchase = (_address: string, _amount: number) => ({
    wait: () => { },
    hash: `0x${genRanHex(64)}`,
  })
  balanceOf = () => Promise.resolve(new BigNumber(1000000000));
  certifiedTransfer = () => Promise.resolve({
    confirmations: 1,
    hash: `0x${genRanHex(64)}`,
  })

  provider = {
    waitForTransaction: () => Promise.resolve({})
  }
  estimate = {
    certifiedTransfer: () => Promise.resolve(1000)
  }
}

export function GetContract() {
  return new Contract();
}

export function ConnectContract() {
  return new Contract();
}
