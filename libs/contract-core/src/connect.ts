import { TheCoin } from "./codegen";
import { GetContract } from "./contract";
import { connect } from '@thecointech/contract-base/connect';
import type { Signer } from "@ethersproject/abstract-signer";

export async function ConnectContract(signer: Signer, onFailure?: (err: Error) => void): Promise<TheCoin> {
  // First fetch contract
  const contract = await GetContract();
  return connect(signer, contract, onFailure);
}
