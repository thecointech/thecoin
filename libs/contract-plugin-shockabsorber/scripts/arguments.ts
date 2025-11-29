import { GetContract as getCore } from '@thecointech/contract-core';
import { getContract as getOracle } from '@thecointech/contract-oracle';
import type { AddressLike } from 'ethers';

export async function getArguments() : Promise<[AddressLike, AddressLike]> {
  // this contract depends on the core contract & oracle
  const tcCore = await getCore();
  const oracle = await getOracle();
  return [
    await tcCore.getAddress(),
    await oracle.getAddress(),
  ];
}
