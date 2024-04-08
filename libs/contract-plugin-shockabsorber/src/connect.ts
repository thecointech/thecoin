import { connect } from '@thecointech/contract-base/connect';
import type { Signer } from '@ethersproject/abstract-signer';
import { getContract } from './contract';
import type { ShockAbsorber } from './codegen/contracts/ShockAbsorber';

export async function connectShockAbsorber(signer: Signer, onFailure?: (err: Error) => void): Promise<ShockAbsorber> {
  // First fetch contract
  const contract = await getContract();
  return connect(signer, contract, onFailure);
}
