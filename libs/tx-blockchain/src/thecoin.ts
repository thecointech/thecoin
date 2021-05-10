import { GetContract } from "@thecointech/contract";
import { Contract } from "ethers";
import { BigNumber } from "ethers/utils";
import { loadAndMergeHistory, calculateTxBalances } from "./fetch";
import { Transaction } from "./types";


// we have 2 accounts (in & out) for the same entity
export const cadbrokerOut = "0x2fe3cbf59a777e8f4be4e712945ffefc6612d46f";
export const cadbrokerIn = "0x38de1b6515663dbe145cc54179addcb963bb606a";

export async function fetchCoinHistory(contract?: Contract) {
  const tc = contract ?? await GetContract();

  let history : Transaction[] = [];
  history = await loadAndMergeHistory(cadbrokerOut, 0, tc, history);
  history = await loadAndMergeHistory(cadbrokerIn, 0, tc, history);

  const balanceOut = await tc.balanceOf(cadbrokerOut) as BigNumber;
  const balanceIn = await tc.balanceOf(cadbrokerIn) as BigNumber;

  calculateTxBalances(balanceOut.add(balanceIn), history);
  return history;
}
