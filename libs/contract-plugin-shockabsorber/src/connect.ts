import { connect } from '@thecointech/contract-base/connect';
import type { Signer } from 'ethers';
import { getContract } from './contract';
import type { ShockAbsorber } from './codegen/contracts/ShockAbsorber';

export async function connectShockAbsorber(signer: Signer): Promise<ShockAbsorber> {
  // First fetch contract
  const contract = await getContract();
  return connect(signer, contract);
}
