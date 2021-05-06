import { processUnsettledDeposits } from '.'
import { init } from '@thecointech/firestore/mock';
import { GetContract } from '@thecointech/contract';
import { getCurrentState } from 'statemachine/types';

// Don't go to the server for this
jest.mock('@thecointech/email');

// it('We have valid deposits', async () => {

//   const deposits = await getDepositsToProcess();
//   expect(deposits).not.toBeUndefined();

//   for (const deposit of deposits) {
//     console.log(`Deposit from: ${deposit.etransfer.name} - ${deposit.etransfer.recieved?.toLocaleString()}`);
//     const { record } = deposit;
//     expect(record.type).toBe(PurchaseType.etransfer);
//     expect(record.fiatDisbursed).toBeGreaterThan(0);
//     expect(record.transfer.value).toBeGreaterThan(0);
//     expect(record.recievedTimestamp).toBeTruthy();
//     expect(record.processedTimestamp).toBeTruthy();
//     expect(record.completedTimestamp).toBeUndefined();
//   }
// })

it("Can complete deposits", async () => {

  jest.setTimeout(900000);
  init({});

  const theContract = await GetContract();
  const deposits = await processUnsettledDeposits(theContract);
  // First, ensure that we have added our users to the DB
  for (const deposit of deposits) {
    // seed the deposit so it's visible in our emulator
    await deposit.action.doc.parent.parent!.set({visible: true});
  }
  // At least one passed
  const results = deposits.map(getCurrentState);
  expect(results.find(d => d.state == "complete")).toBeTruthy();

  // If passed, balance is 0
  for (const result of results) {
    if (result.state == "complete") {
      expect(result.data.coin.isZero()).toBeTruthy();
      expect(result.data.fiat.isZero()).toBeTruthy();
    }
  }
})
