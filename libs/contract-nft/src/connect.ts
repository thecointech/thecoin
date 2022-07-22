import { Signer } from "@ethersproject/abstract-signer"
import { getContract } from "./contract";
import { connect } from '@thecointech/contract-base/connect';
import type { TheGreenNFT } from ".";

export async function connectNFT(signer: Signer, onFailure?: (err: Error) => void): TheGreenNFT {
  const contract = await getContract();
  return connect(signer, contract, onFailure);
}
