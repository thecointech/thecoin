import { FetchDepositEmails, GetDepositsToProcess, ProcessUnsettledDeposits } from './service'
import { PurchaseType } from "../base/types";
import { init } from '@the-coin/utilities/firestore/mock';
//import { init, describe, release } from '@the-coin/utilities/firestore/jestutils';
import { InitContract } from './contract';
import { GetUserDoc } from "@the-coin/utilities/User";
import { ConfigStore } from '@the-coin/store';

// Don't go to the server for this
//jest.mock('googleapis');
//jest.mock('@the-coin/rbcapi');
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

it('Can fetch emails', async () => {
  const deposits = await FetchDepositEmails();
  expect(deposits).not.toBeUndefined();
  // ensure these are all test emails;
  const allTests = deposits.every(d => d.instruction.name.indexOf('TEST') >= 0);
  expect(allTests).toBe(true);

  // ensure we have sourceID;
  const allSources = deposits.every(d => !!d.record.sourceId);
  expect(allSources).toBe(true);
})
it('We have valid deposits', async () => {

  const deposits = await GetDepositsToProcess();
  expect(deposits).not.toBeUndefined();

  for (const deposit of deposits) {
    console.log(`Deposit from: ${deposit.instruction.name} - ${deposit.instruction.recieved?.toLocaleString()}`);
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
    await GetUserDoc(deposit.instruction.address).set({visible: true});
  }

  for (const deposit of deposits) {
    if (deposit.record.hash) {
      expect(deposit.isComplete).toBeTruthy();
      expect(deposit.record.completedTimestamp).toBeTruthy();
    }
  }
})
