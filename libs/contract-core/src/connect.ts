import type { TheCoin } from "./codegen";
import { GetContract } from "./contract";
import { connect } from '@thecointech/contract-base/connect';
import type { Signer } from "ethers";

export async function ConnectContract(signer: Signer): Promise<TheCoin> {
  // First fetch contract
  const contract = await GetContract();
  return connect(signer, contract);
}
