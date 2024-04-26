import * as Src from '.';
import { AddressLike, BigNumberish, ContractTransaction, Signer } from 'ethers'
import { sleep } from '@thecointech/async'
import { ALL_PERMISSIONS } from '@thecointech/contract-plugins';
import { PluginAndPermissionsStructOutput } from './codegen/contracts/TheCoinL1';
import { StateMutability, TypedContractMethod } from './codegen/common';
export * from './constants';

const genRanHex = (size: number) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
let nonce = 12;
let confirmations = 1;
let lastTxVal: BigNumberish|undefined = undefined;


const makeFn = <
A extends Array<any> = Array<any>,
R = any,
S extends StateMutability = "payable"
>(r: (...a: A) => R, _s?: S) => r as any as TypedContractMethod<A, [Awaited<R>], S>;
export class TheCoin implements Pick<Src.TheCoin, 'uberTransfer'|'getUsersPlugins'|'exactTransfer' | 'balanceOf' | 'certifiedTransfer'>{

  signer?: Signer;
  constructor(signer?: Signer) {
    this.signer = signer;
  }
  // prefix is (e) for exactTransfer and (c) for certifiedTransfer, and (0) for other
  // We embed this in the identifier so we can tell through the rest of the mock
  // what kind of transaction it represented
  genReceipt = (prefix: string = '0', opts?: any, txval?: BigNumberish) => {
    confirmations = 2;
    lastTxVal = txval;
    return {
      wait: () => { },
      hash: `0x${prefix}${genRanHex(63)}`,
      ...opts,
      nonce: nonce++,
    } as any as ContractTransaction
  }

  mintCoins = () => this.genReceipt();
  burnCoins = () => this.genReceipt();
  exactTransfer = makeFn((_: AddressLike, _value: BigNumberish, _t: any) => {}, "nonpayable");
  balanceOf = makeFn((_: AddressLike) => 995000000n, "view");
  certifiedTransfer = makeFn((..._args: any[]) => {}, "nonpayable") //this.genReceipt('c', { confirmations: 1 }, args[3]), "nonpayable");
  uberTransfer = makeFn((..._args: any[]) => {}, "nonpayable") //this.genReceipt('c', { confirmations: 1 }))
  // Run during testing.  Remove once deployement is secure.
  runCloneTransfer = () => this.genReceipt();
  getUsersPlugins = makeFn((_s: AddressLike) => [{
    plugin: "RoundNumber",
    permissions: ALL_PERMISSIONS,
  } as PluginAndPermissionsStructOutput]
  , "view");

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
        address: process.env.WALLET_BrokerCAD_ADDRESS,
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
    getTransaction: () => Promise.resolve({ wait: () => sleep(2000) }),
    getTransactionReceipt: () => Promise.resolve({ blockNumber: 123, blockHash: "0x45678" }),
    getTransactionCount: () => Promise.resolve(1),
    getFeeData: () => Promise.resolve({
      maxFeePerGas: 1000n,
      maxPriorityFeePerGas: 1000n,
      gasPrice: 1000n,
    })
  }
  estimate = {
    certifiedTransfer: () => Promise.resolve(1000)
  }
  interface = {
    // Only used by fetchExactTimestamps
    parseLog: (item: any) => {
      const isOut = item.transactionHash[2] == 'c';
      const to = isOut ? process.env.WALLET_BrokerCAD_ADDRESS : '0x445758E37F47B44E05E74EE4799F3469DE62A2CB';
      const from = isOut ? '0x445758E37F47B44E05E74EE4799F3469DE62A2CB' : process.env.WALLET_BrokerCAD_ADDRESS;
      return {
        name: "ExactTransfer",
        args: {
          timestamp: BigInt(`0x${item.data.slice(66)}`),
          from, // random address, currently ignored
          to,
          amount: BigInt(lastTxVal ?? 20000000),
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
export const ConnectContract: typeof Src.ConnectContract = (signer: Signer) => new TheCoin(signer) as any;
export const InitialCoinBlock = 0;
