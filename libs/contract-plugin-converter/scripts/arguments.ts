import { ContractCore } from "@thecointech/contract-core"
import { ContractOracle } from "@thecointech/contract-oracle"
import type { AddressLike } from "ethers";

export async function getArguments() : Promise<[AddressLike, AddressLike]> {
  // this contract depends on the core contract & oracle
  const tcCore = await ContractCore.get();
  const oracle = await ContractOracle.get();
  return [
    await tcCore.getAddress(),
    await oracle.getAddress(),
  ]
}
