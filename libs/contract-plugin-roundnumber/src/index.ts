import { connect } from '@thecointech/contract-base/connect';
import { getContract } from './contract';
import type { Signer } from "@ethersproject/abstract-signer";
import { RoundNumber } from './codegen';
export * from './contract';
export type { RoundNumber} from './codegen/contracts/RoundNumber';

export async function connectConverter(signer: Signer, onFailure?: (err: Error) => void): Promise<RoundNumber> {
  // First fetch contract
  const contract = await getContract();
  return connect(signer, contract, onFailure);
}
