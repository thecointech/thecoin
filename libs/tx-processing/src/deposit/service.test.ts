import { GetDepositsToProcess, ProcessUnsettledDeposits } from './service'
import { init } from '@the-coin/utilities/firestore/mock';
import { InitContract } from './contract';
import { GetUserDoc } from "@the-coin/utilities/User";
import { ConfigStore } from '@the-coin/store';
import { PurchaseType } from '@the-coin/tx-firestore';

// Don't go to the server for this
jest.mock('@the-coin/email');

beforeAll(async () => {
  const timeout = 30 * 60 * 1000;
  jest.setTimeout(timeout);
  ConfigStore.initialize();
  InitContract({} as any);
  await init({});
});

afterAll(() => {
  ConfigStore.release();
});

it('We have valid deposits', async () => {

  const deposits = await GetDepositsToProcess();
  expect(deposits).not.toBeUndefined();

  for (const deposit of deposits) {
    console.log(`Deposit from: ${deposit.etransfer.name} - ${deposit.etransfer.recieved?.toLocaleString()}`);
    const { record } = deposit;
    expect(record.type).toBe(PurchaseType.etransfer);
    expect(record.fiatDisbursed).toBeGreaterThan(0);
    expect(record.transfer.value).toBeGreaterThan(0);
    expect(record.recievedTimestamp).toBeTruthy();
    expect(record.processedTimestamp).toBeTruthy();
    expect(record.completedTimestamp).toBeUndefined();
  }
})

it("Can complete deposits", async () => {

  jest.setTimeout(900000);

  const deposits = await ProcessUnsettledDeposits();
  // First, ensure that we have added our users to the DB
  for (const deposit of deposits) {
    // seed the deposit so it's visible in our emulator
    await GetUserDoc(deposit.etransfer.address).set({visible: true});
  }
  // At least one passed
  expect(deposits.find(d => d.isComplete)).toBeTruthy();
  // If passed, confirmed appropriately
  for (const deposit of deposits) {
    if (deposit.record.hash) {
      expect(deposit.isComplete).toBeTruthy();
      expect(deposit.record.completedTimestamp).toBeTruthy();
    }
  }
})
