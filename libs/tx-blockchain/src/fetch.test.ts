import { loadAndMergeHistory, calculateTxBalances, mergeTransactions } from "./fetch";
import { GetContract } from '@the-coin/contract';
import { BigNumber } from "ethers/utils";
import { Contract } from "ethers";
import { Transaction } from "types";


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

it('Can fetch all transactions', async () => {
  jest.setTimeout(10 * 60 * 1000); // 10 mins to process this (todo: cache the data)
  const contract = await GetContract();
  // we have 2 accounts (in & out) for the same entity
  const cadbrokerOut = "0x2fe3cbf59a777e8f4be4e712945ffefc6612d46f";
  const cadbrokerIn = "0x38de1b6515663dbe145cc54179addcb963bb606a";

  console.log("Loading Out txs");
  const historyOut = await fetchAndTestBalance(cadbrokerOut, contract);
  console.log("Loading In txs");
  const historyIn = await fetchAndTestBalance(cadbrokerIn, contract);

  const history = mergeTransactions(historyOut, historyIn);
  const totalBalance = historyOut[0].balance  + historyIn[0].balance;
  validateHistory(history, new BigNumber(totalBalance));

  // const historyOut = await loadAndMergeHistory(cadbrokerOut, 0, contract, []);
  // console.log(`Completed with ${historyOut.length} transactions loaded`);
  // const balanceOut = await contract.balanceOf(cadbrokerOut) as BigNumber;
  // calculateTxBalances(balanceOut, historyOut);
  // expect(historyOut[0].balance).toBe(historyOut[0].change);
  // expect(historyOut[historyOut.length - 1].balance).toBe(balanceOut.toNumber());

  // console.log("Loading In txs");
  // const historyIn = await loadAndMergeHistory(cadbrokerIn, 0, contract, []);
  // console.log(`Completed with ${historyIn.length} transactions loaded`);
  // const balanceIn = await contract.balanceOf(cadbrokerIn) as BigNumber;
  // calculateTxBalances(balanceIn, historyIn);
  // expect(historyIn[0].balance).toBe(0);

  //const balance = balanceIn.add(balanceOut);

  // Not sure what we can test for here other than the code functions!
  //expect(history[0].balance).toBe(0);
})
