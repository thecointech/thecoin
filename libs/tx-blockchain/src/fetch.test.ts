import { jest } from '@jest/globals';
import { loadAndMergeHistory } from "./fetch";
import { ContractCore, TheCoin } from '@thecointech/contract-core';
import { describe, IsManualRun } from '@thecointech/jestutils';
import { initAllAddresses } from './setup.test';

async function fetchAndTestBalance(contract: TheCoin) {
  const history = await loadAndMergeHistory(0, contract);
  return history;
}

// function validateHistory(history: Transaction[], balance: BigNumber) {
//   calculateTxBalances(balance, history);
//   expect(history[0].balance).toBe(history[0].change);
//   expect(history[history.length - 1].balance).toBe(balance.toNumber());
// }

//
// Easy-to-debug fetch of all history
// NOTE: This is probably non-functional
describe("Fetch live data", () => {

  beforeAll(initAllAddresses);

  it('Can fetch transactions', async () => {
    jest.setTimeout(10 * 60 * 1000); // 10 mins to process this (todo: cache the data)
    const contract = await ContractCore.get();
    console.log("Loading out txs");
    await fetchAndTestBalance(contract);
  })
}, IsManualRun);
