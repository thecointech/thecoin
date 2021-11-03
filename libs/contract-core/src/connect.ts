import { TheCoin } from "./types/TheCoin";
import { GetContract } from "./contract";
import { connect } from '@thecointech/contract-base/connect';
import type { Signer } from "@ethersproject/abstract-signer";

export function ConnectContract(signer: Signer, onFailure?: (err: Error) => void): TheCoin {
  // First fetch contract
  const contract = GetContract();
  return connect(signer, contract, onFailure);
}
