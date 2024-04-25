import { getContract } from "./contract";
import { connect } from '@thecointech/contract-base/connect';
import type { Signer } from "ethers";
import type { SpxCadOracle } from './codegen/contracts/SpxCadOracle';

export async function connectOracle(signer: Signer, onFailure?: (err: Error) => void): Promise<SpxCadOracle> {
  // First fetch contract
  const contract = await getContract();
  return connect(signer, contract, onFailure);
}
