import { GetContract as getCore } from '@thecointech/contract-core';
import { getContract as getOracle } from '@thecointech/contract-oracle';

export async function getArguments() : Promise<[string, string]> {
  // this contract depends on the core contract & oracle
  const tcCore = await getCore();
  const oracle = await getOracle();
  return [
    tcCore.address,
    oracle.address,
  ];
}
