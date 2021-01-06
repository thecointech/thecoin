import { loadAndMergeHistory, calculateTxBalances, mergeTransactions } from "./fetch";
import { GetContract } from '@the-coin/contract';
import { BigNumber } from "ethers/utils";
import { Contract } from "ethers";


async function fetchAndTestBalance(adress: string, contract: Contract) {
  const history = await loadAndMergeHistory(adress, 0, contract, []);
  const balanceOut = await contract.balanceOf(adress) as BigNumber;
  calculateTxBalances(balanceOut, history);
  expect(history[0].balance).toBe(history[0].change);
  expect(history[history.length - 1].balance).toBe(balanceOut.toNumber());
  return history;
}

it('Can fetch all transactions', async () => {
  jest.setTimeout(300000);
  const contract = await GetContract();
  // we have 2 accounts (in & out) for the same entity
  const cadbrokerOut = "0x2fe3cbf59a777e8f4be4e712945ffefc6612d46f";
  const cadbrokerIn = "0x38de1b6515663dbe145cc54179addcb963bb606a";

  console.log("Loading Out txs");
  const historyOut = await fetchAndTestBalance(cadbrokerOut, contract);
  console.log("Loading In txs");
  const historyIn = await fetchAndTestBalance(cadbrokerIn, contract);

  const history = mergeTransactions(historyOut, historyIn);
  expect(history).toBeTruthy();
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
