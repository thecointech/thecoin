import { log } from '@thecointech/logging';
// import { AnyActionContainer, NamedTransition } from '../types';
// import { last } from '@thecointech/utilities';
// import { ActionType } from "@thecointech/broker-db";
// import { getOverrideFees } from "@thecointech/contract-base/overrides";
import type { TransactionResponse } from 'ethers';

// Don't log the actual transaction details
export const ignoredTxParams = ["data", "value", "accessList", "raw", "r", "s", "v"];
export const convertBN = (key: string, val: any) => (
  ignoredTxParams.includes(key) || !val
    ? undefined
    : (typeof val == "bigint")
      ? Number(val)
      : val
);

export const toDelta = (tx: TransactionResponse) => {
  if (!tx.hash) return {
    error: "Missing transaction hash",
    hash: undefined,
  }

  try {
    return {
      hash: tx.hash,
      meta: JSON.stringify(tx, convertBN),
    }
  } catch(e: any) {
    log.error(e, `Error converting {hash}`, {hash: tx.hash});
    return {
      error: e.message ?? e.toString(),
      hash: undefined,
    }
  }
}
