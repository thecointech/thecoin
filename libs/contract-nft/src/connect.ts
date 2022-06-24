import { Signer } from "@ethersproject/abstract-signer"
import { getContract } from "./contract";
import { connect } from '@thecointech/contract-base/connect';
import type { TheGreenNFT } from ".";

export function connectNFT(signer: Signer, onFailure?: (err: Error) => void): TheGreenNFT {
  const contract = getContract();
  return connect(signer, contract, onFailure);
}
