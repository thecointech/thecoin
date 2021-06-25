import { loadAndMergeHistory, calculateTxBalances } from "./fetch";
import { GetContract } from '@thecointech/contract';
import { BigNumber } from "ethers/utils";
import { Contract } from "ethers";
import { Transaction } from "./types";
import { cadbrokerIn, cadbrokerOut } from "./thecoin";
import { describe, IsManualRun } from '@thecointech/jestutils';

async function fetchAndTestBalance(adress: string, contract: Contract) {
  const history = await loadAndMergeHistory(adress, 0, contract, []);
  const balance = await contract.balanceOf(adress) as BigNumber;
  validateHistory(history, balance);
  return history;
}

function validateHistory(history: Transaction[], balance: BigNumber) {
  calculateTxBalances(balance, history);
  expect(history[0].balance).toBe(history[0].change);
  expect(history[history.length - 1].balance).toBe(balance.toNumber());
}

//
// Easy-to-debug fetch of all history
describe("Fetch live data", () => {

  it('Can fetch out transactions', async () => {
    jest.setTimeout(10 * 60 * 1000); // 10 mins to process this (todo: cache the data)
    const contract = await GetContract();
    console.log("Loading out txs");
    await fetchAndTestBalance(cadbrokerOut, contract);
  })

  it('Can fetch in transactions', async () => {
    jest.setTimeout(10 * 60 * 1000); // 10 mins to process this (todo: cache the data)
    const contract = await GetContract();
    console.log("Loading In txs");
    await fetchAndTestBalance(cadbrokerIn, contract);
  })
}, IsManualRun);
