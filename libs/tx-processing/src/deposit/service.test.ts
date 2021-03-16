import { GetDepositsToProcess, ProcessUnsettledDeposits } from './service'
import { init } from '@thecointech/utilities/firestore/mock';
import { GetUserDoc } from "@thecointech/utilities/User";
import { getContract } from "@thecointech/utilities/Wallets";
import { ConfigStore } from '@thecointech/store';
import { PurchaseType } from '@thecointech/tx-firestore';

// Don't go to the server for this
jest.mock('@thecointech/email');

beforeAll(async () => {
  const timeout = 30 * 60 * 1000;
  jest.setTimeout(timeout);
  ConfigStore.initialize();
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

  const theContract = await getContract('BrokerCAD');
  const deposits = await ProcessUnsettledDeposits(theContract);
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
