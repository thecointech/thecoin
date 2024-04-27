import { Signer } from "ethers"
import { getContract } from "./contract";
import { connect } from '@thecointech/contract-base/connect';

export async function connectNFT(signer: Signer, onFailure?: (err: Error) => void) {
  const contract = await getContract();
  return connect(signer, contract, onFailure);
}
