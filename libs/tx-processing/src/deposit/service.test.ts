import { FetchDepositEmails, GetDepositsToProcess } from './service'
import { PurchaseType } from "../base/types";
import { signIn } from "../firestore";
import { RbcStore } from '@the-coin/rbcapi';
import { ConfigStore } from '@the-coin/store';

// Don't go to the server for this
//jest.mock('googleapis');
jest.mock('@the-coin/rbcapi');


beforeAll(async () => {
  const timeout = 30 * 60 * 1000;
  jest.setTimeout(timeout);
  RbcStore.initialize();
  ConfigStore.initialize();

  // NOTE: this will fail without a saved username/password
  await signIn();
});

afterAll(() => {
  RbcStore.release();
  ConfigStore.release();
});

it('Can fetch emails', async () => {
  const deposits = await FetchDepositEmails();
  expect(deposits).not.toBeUndefined();
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