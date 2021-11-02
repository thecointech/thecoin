import { GetContract, TheCoin } from "@thecointech/contract";
import { BigNumber } from "ethers";
import { loadAndMergeHistory, calculateTxBalances, mergeTransactions } from "./fetch";


// we have 2 accounts (in & out) for the same entity
export const cadbrokerOut = "0x2fe3cbf59a777e8f4be4e712945ffefc6612d46f";
export const cadbrokerIn = "0x38de1b6515663dbe145cc54179addcb963bb606a";

export async function fetchCoinHistory(contract?: TheCoin) {
  const tc = contract ?? await GetContract();

  const historyOut = await loadAndMergeHistory(cadbrokerOut, 0, tc);
  const historyIn = await loadAndMergeHistory(cadbrokerIn, 0, tc);
  const history = mergeTransactions(historyOut, historyIn);

  const balanceOut = await tc.balanceOf(cadbrokerOut) as BigNumber;
  const balanceIn = await tc.balanceOf(cadbrokerIn) as BigNumber;

  calculateTxBalances(balanceOut.add(balanceIn), history);
  return history;
}
