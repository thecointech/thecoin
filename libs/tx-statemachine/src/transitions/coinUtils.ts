import { TransactionResponse } from "@ethersproject/abstract-provider";
import { BigNumber } from '@ethersproject/bignumber';
import { log } from '@thecointech/logging';

// Don't log the actual transaction details
export const ignoredTxParams = ["data", "value", "accessList", "raw", "r", "s", "v"];
export const convertBN = (key: string, val: any) => (
  ignoredTxParams.includes(key) || !val
    ? undefined
    : (val.type == "BigNumber" && val.hex)
      ? BigNumber.from(val.hex).toNumber()
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
  } catch(e) {
    log.error(e, `Error converting {hash}`, {hash: tx.hash});
    return {
      error: e.error,
      hash: undefined,
    }
  }
}
