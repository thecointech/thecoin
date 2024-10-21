import { getContract } from "./contract";
import { connect } from '@thecointech/contract-base/connect';
import type { Signer } from "ethers";
import type { UberConverter } from './codegen/contracts/UberConverter';

export async function connectConverter(signer: Signer): Promise<UberConverter> {
  // First fetch contract
  const contract = await getContract();
  return connect(signer, contract);
}
