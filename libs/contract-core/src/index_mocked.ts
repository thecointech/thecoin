import * as Src from '.';
import { BigNumber, ContractTransaction } from 'ethers'

export const COIN_EXP = 1000000;

const genRanHex = (size: number) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
let nonce = 12;
let confirmations = 1;
export class TheCoin implements Pick<Src.TheCoin, 'exactTransfer' | 'balanceOf' | 'certifiedTransfer'>{

  // prefix is (e) for exactTransfer and (c) for certifiedTransfer, and (0) for other
  // We embed this in the identifier so we can tell through the rest of the mock
  // what kind of transaction it represented
  genReceipt = (prefix: string = '0', opts?: any) => {
    confirmations = 2;
    return Promise.resolve({
      wait: () => { },
      hash: `0x${prefix}${genRanHex(63)}`,
      ...opts,
      nonce: nonce++,
    } as any as ContractTransaction)
  }

  mintCoins = () => this.genReceipt();
  burnCoins = () => this.genReceipt();
  exactTransfer = () => this.genReceipt('e');
  balanceOf = () => Promise.resolve(BigNumber.from(1000000000));
  certifiedTransfer = () => this.genReceipt('c', { confirmations: 1 })
  // Run during testing.  Remove once deployement is secure.
  runCloneTransfer = () => this.genReceipt();



  provider = {
    waitForTransaction: (hash: string) => Promise.resolve({
      confirmations: confirmations++,
      status: 1,
      logs: [{
        transactionHash: hash,
        logIndex: "0x1",
        transactionIndex: "0x0",
        blockHash: "0x69c0f8b66f0479886348db0859468527d154e3bd6bdac90db989b0092c130a07",
        blockNumber: "0x14",
        address: "0x23544d1596b2d8f608d1fd441131e719e0c5a685",
        data: "0x0000000000000000000000000000000000000000000000000000000003a39dbd00000000000000000000000000000000000000000000000000000179e00cb316",
        topics: [
          "0x53abef67a06a7d88762ab2558635c2ccf615af355d42c5a0c98715be5fb39e75",
          "client",
          "broker"
        ],
        type: "mined"
      }]
    }),
    getLogs: () => Promise.resolve([]),
    getBlockNumber: () => Promise.resolve(12345),
    getTransaction: () => Promise.resolve({ wait: () => delay(2000) }),
    getTransactionReceipt: () => Promise.resolve({ blockNumber: 123, blockHash: "0x45678" })
  }
  estimate = {
    certifiedTransfer: () => Promise.resolve(1000)
  }
  interface = {
    // Only used by fetchExactTimestamps
    parseLog: (item: any) => {
      const isOut = item.transactionHash[2] == 'c';
      const to = isOut ? "0x23544d1596b2d8f608d1fd441131e719e0c5a685" : '0x445758E37F47B44E05E74EE4799F3469DE62A2CB';
      const from = isOut ? '0x445758E37F47B44E05E74EE4799F3469DE62A2CB' : "0x23544d1596b2d8f608d1fd441131e719e0c5a685";
      return {
        name: "ExactTransfer",
        args: {
          timestamp: BigNumber.from(`0x${item.data.slice(66)}`),
          from, // random address, currently ignored
          to,
          amount: BigNumber.from(20000000),
        }
      }
    },
  }
  filters = {
    Transfer: (...addresses: string[]) => ({ topics: [null, ...addresses] }),
    ExactTransfer: (...addresses: string[]) => ({ topics: [null, ...addresses] }),
  }
}

export const GetContract: typeof Src.GetContract = () => new TheCoin() as any;
export const ConnectContract: typeof Src.ConnectContract = () => new TheCoin() as any;
export const InitialCoinBlock = 0;
