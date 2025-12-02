import { AddressLike, resolveAddress } from 'ethers';
import { BigNumberish } from 'ethers';
import type { TheGreenNFT } from '../src';
import { StateMutability, TypedContractMethod } from '../src/codegen/common';
import { genReceipt } from '@thecointech/contract-tools/mockContractUtils';
import { defineContractBaseSingleton } from '@thecointech/contract-base/singleton';

export * from "../src/gassless";
export * from "../src/tokenCodes";

const makeFn = <
A extends Array<any> = Array<any>,
R = any,
S extends StateMutability = "payable"
>(r: (...a: A) => R, _s?: S) => r as any as TypedContractMethod<A, [Awaited<R>], S>;

class MockNFT implements Pick<TheGreenNFT, "balanceOf"|"claimToken"> {
  tokens: string[] = [];

  balanceOf = makeFn((owner: AddressLike) => {
    return Promise.resolve(BigInt(
      this.tokens.filter(t => t === owner).length
    ))
  }, "view")
  claimToken = makeFn(async (tokenId: BigNumberish, claimant: AddressLike, _sig: any) => {
    this.tokens[Number(tokenId)] = await resolveAddress(claimant);
    return genReceipt() as any;
  }, "nonpayable")
}

export const ContractNFT = defineContractBaseSingleton<TheGreenNFT>(
  '__nft',
  async () => new MockNFT() as any,
);
