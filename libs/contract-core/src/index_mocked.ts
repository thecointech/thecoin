import * as Src from  '.';
import { BigNumber, ContractTransaction } from 'ethers'

export const COIN_EXP = 1000000;

const genRanHex = (size: number) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
export class TheCoin implements Pick<Src.TheCoin, 'exactTransfer'|'balanceOf'|'certifiedTransfer'>{

  genReceipt = (opts?: any) => Promise.resolve({
    wait: () => { },
    hash: `0x${genRanHex(64)}`,
    ...opts,
  } as any as ContractTransaction)

  mintCoins = () => this.genReceipt();
  meltCoins = () => this.genReceipt();
  exactTransfer = () => this.genReceipt();
  balanceOf = () => Promise.resolve(BigNumber.from(1000000000));
  certifiedTransfer = () => this.genReceipt({confirmations: 1})
  // Run during testing.  Remove once deployement is secure.
  runCloneTransfer = () => this.genReceipt();



  provider = {
    waitForTransaction: () => Promise.resolve({}),
    getLogs: () => Promise.resolve([]),
    getBlockNumber: () => Promise.resolve(12345),
    getTransaction: () => Promise.resolve({ wait: () => delay(2000) }),
    getTransactionReceipt: () => Promise.resolve({ blockNumber: 123, blockHash: "0x45678"})
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
export const InitialCoinBlock = 0;
