import { Signer } from "ethers"
import { getContract } from "./contract";
import { connect } from '@thecointech/contract-base/connect';
import { TheGreenNFT } from "./index";

export async function connectNFT(signer: Signer) : Promise<TheGreenNFT> {
  const contract = await getContract();
  return connect(signer, contract);
}
