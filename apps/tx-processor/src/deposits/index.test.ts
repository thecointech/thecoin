import { processUnsettledDeposits } from '.'
import { init } from '@thecointech/firestore/mock';
import { GetContract } from '@thecointech/contract';
import { getCurrentState } from '@thecointech/tx-processing';
import { RbcApi } from '@thecointech/rbcapi';
import { log } from '@thecointech/logging';

jest.mock('@thecointech/email');
jest.mock('@thecointech/utilities/MarketStatus', () => ({
  NextOpenTimestamp: (date: Date) => date.getTime()
}))
jest.setTimeout(900000);

it("Can complete deposits", async () => {

  init({});
  const error = jest.spyOn(log, 'error').mockImplementation();

  const theContract = await GetContract();
  const bank = new RbcApi();
  const deposits = await processUnsettledDeposits(theContract, bank);
  // First, ensure that we have added our users to the DB
  for (const deposit of deposits) {
    // seed the deposit so it's visible in our emulator
    await deposit.action.doc.parent.parent!.set({ visible: true });
  }
  const results = deposits.map(getCurrentState);
  // At least one passed
  expect(results.find(d => d.name == "complete")).toBeTruthy();
  // We should have a few failures too
  expect(results.find(d => d.name != "complete")).toBeTruthy();
  expect(error).toBeCalledTimes(6);

  // If passed, balance is 0
  for (let i = 0; i < deposits.length; i++) {
    const result = results[i];
    // All emails should be appropriately marked
    expect(deposits[i].instructions?.raw?.labelIds).toContain('etransfer')
    if (result.name == "complete") {
      expect(result.data.hash).toBeTruthy();
      expect(result.data.coin?.isZero()).toBeTruthy();
      expect(result.data.fiat?.isZero()).toBeTruthy();
      expect(deposits[i].instructions?.raw?.labelIds).toContain('deposited')
    }
    else {
      expect(result.name).toEqual('error')
      expect(result.data.hash).toBeUndefined();

      // If we have no value, then the deposits were not completed
      if (result.data.fiat === undefined || result.data.coin !== undefined) {
        expect(deposits[i].instructions?.raw?.labelIds).not.toContain('deposited')
      }
    }
  }
})
