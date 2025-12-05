import * as Src from '../src';
import { genReceipt } from '@thecointech/contract-tools/mockContractUtils';
import { StateMutability, TypedContractMethod } from '../src/codegen/common';
import { defineContractBaseSingleton } from '@thecointech/contract-base/singleton';

const makeFn = <
A extends Array<any> = Array<any>,
R = any,
S extends StateMutability = "payable"
>(r: (...a: A) => R, _s?: S) => r as any as TypedContractMethod<A, [Awaited<R>], S>;

export class UberConverter implements Pick<Src.UberConverter, 'processPending'|'getAddress'> {

  address = "0xC000000000000000000000000000000000000000";

  // "0xC0"
  // prefix is (c) for sending to the coin
  genReceipt = genReceipt;
  getAddress = () => Promise.resolve(this.address);
  processPending = (() => this.genReceipt('c')) as any
  connect = () => this
}

export const ContractConverter: typeof Src.ContractConverter = defineContractBaseSingleton<Src.UberConverter>('__converter', async () => {
  return new UberConverter() as any
})
