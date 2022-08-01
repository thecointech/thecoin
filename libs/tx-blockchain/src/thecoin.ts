import { GetContract } from "@thecointech/contract-core";
import { loadAndMergeHistory } from "./fetch";

export async function fetchCoinHistory() {
  const tc = await GetContract();
  const history = await loadAndMergeHistory(0, tc);
  // Remove all zero-sized transactions
  return history.filter(tx => tx.change);
}
