import { RbcStore } from "../RbcApi/store";
import { ConfigStore } from "../store";
import {FetchDepositEmails, GetDepositsToProcess, ProcessUnsettledDeposits} from './service'
import { PurchaseType } from "../autoaction/types";
import { signIn } from "../utils/Firebase";

beforeAll(async () => {
  const timeout = 30 * 60 * 1000;
  jest.setTimeout(timeout);
  RbcStore.initialize();
  ConfigStore.initialize();

  await signIn()
});

afterAll(() => {
    RbcStore.release();
    ConfigStore.release();
});

test('Can fetch emails', async ()=> {
  const deposits = await FetchDepositEmails();
  expect(deposits).not.toBeUndefined();
})

test('We have valid deposits', async ()=> {
  const deposits = await GetDepositsToProcess();
  expect(deposits).not.toBeUndefined();

  for (const deposit of deposits)
  {
    console.log('Deposit from: ' + deposit.instruction.name);
    const { record} = deposit;
    expect(record.type).toBe(PurchaseType.etransfer);
    expect(record.fiatDisbursed).toBeGreaterThan(0);
    expect(record.transfer.value).toBeGreaterThan(0);
    expect(record.recievedTimestamp).toBeTruthy();
    expect(record.processedTimestamp).toBeTruthy();
    expect(record.completedTimestamp).toBeUndefined();
  }
})

test('we complete all deposits', async ()=> {
  const deposits = await ProcessUnsettledDeposits();
  expect(deposits).not.toBeUndefined();

  for (const deposit of deposits)
  {
    expect(deposit.isComplete).toBeTruthy();
  }
})
