import * as Src from '.';
import { genReceipt } from '@thecointech/contract-tools/mockContractUtils';
import { StateMutability, TypedContractMethod } from './codegen/common';

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
}

export const getContract: typeof Src.getContract = () => new UberConverter() as any;
export const connectConverter: typeof Src.connectConverter = () => new UberConverter() as any;
