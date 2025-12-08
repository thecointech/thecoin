import * as Src from '../src';
import { AddressLike, BigNumberish, Signer, resolveAddress } from 'ethers'
import { sleep } from '@thecointech/async'
import { ALL_PERMISSIONS } from '@thecointech/contract-plugins';
import { PluginAndPermissionsStructOutput } from '../src/codegen/contracts/TheCoinL1';
import { StateMutability, TypedContractMethod } from '../src/codegen/common';
import { genReceipt } from '@thecointech/contract-tools/mockContractUtils';
import { defineContractBaseSingleton } from '@thecointech/contract-base/singleton';
export * from '../src/constants';

let lastTx = undefined as undefined| {
  confirmations: number,
  value: BigNumberish,
  from: string,
  to: string,
}

const setLastTx = async (from: AddressLike, to: AddressLike, value: BigNumberish) => {
  lastTx = {
    confirmations: 1,
    from: await resolveAddress(from),
    to: await resolveAddress(to),
    value: value,
  }
  return genReceipt()
}

type MockedCoin = Pick<Src.TheCoin, 'uberTransfer'|'getUsersPlugins'|'exactTransfer'|'balanceOf'|'certifiedTransfer'|'getAddress'|'connect'|'queryFilter'>

const makeFn = <
A extends Array<any> = Array<any>,
R = any,
S extends StateMutability = "payable"
>(r: (...a: A) => R, _s?: S) => r as any as TypedContractMethod<A, [Awaited<R>], S>;
class TheCoinImp implements MockedCoin {

  signer?: Signer;
  constructor(signer?: Signer) {
    this.signer = signer;
  }
  getAddress = () => Promise.resolve("0x0000000000000000000000000000000000000123");
  connect = (signer: Signer) => {
    this.signer = signer;
    return this as any;
  }
  queryFilter() {
    return Promise.resolve([]);
  }
  mintCoins = () => genReceipt();
  burnCoins = () => genReceipt();
  balanceOf = makeFn((_: AddressLike) => 995000000n, "view");
  pl_balanceOf = makeFn((_: AddressLike) => 995000000n, "view");
  exactTransfer = makeFn(
    async (to: AddressLike, value: BigNumberish, _timestamp: BigNumberish) => await setLastTx(this.signer!, to, value),
    "nonpayable"
  )
  certifiedTransfer = makeFn(
    async (_chainId: BigNumberish, from: AddressLike, to: AddressLike, value: BigNumberish, ..._args: any[]) => await setLastTx(from, to, value),
    "nonpayable"
  )
  uberTransfer = makeFn(
    async (_chainId: BigNumberish, from: AddressLike, to: AddressLike, value: BigNumberish, ..._args: any[]) => await setLastTx(from, to, value),
    "nonpayable"
  )
  // Run during testing.  Remove once deployement is secure.
  runCloneTransfer = () => genReceipt();
  getUsersPlugins = makeFn((_s: AddressLike) => [{
    plugin: "RoundNumber",
    permissions: ALL_PERMISSIONS,
  } as PluginAndPermissionsStructOutput]
  , "view");

  runner = {
    provider: {
      waitForTransaction: (hash: string) => Promise.resolve({
        confirmations: () => lastTx!.confirmations++,
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
      }),
      getBalance: () => Promise.resolve(1000n),
    }
  }

  estimate = {
    certifiedTransfer: () => Promise.resolve(1000)
  }
  interface = {
    // Only used by fetchExactTimestamps
    parseLog: (item: any) => {
      return {
        name: "ExactTransfer",
        args: {
          timestamp: BigInt(`0x${item.data.slice(66)}`),
          from: lastTx!.from, // random address, currently ignored
          to: lastTx!.to,
          amount: BigInt(lastTx!.value),
        }
      }
    },
  }
  filters = {
    Transfer: (...addresses: string[]) => ({ topics: [null, ...addresses] }),
    ExactTransfer: (...addresses: string[]) => ({ topics: [null, ...addresses] }),
  }
}

export const ContractCore = defineContractBaseSingleton<Src.TheCoin>(
  "__theCoin",
  async () => new TheCoinImp() as unknown as Src.TheCoin
)

export const InitialCoinBlock = 0;
