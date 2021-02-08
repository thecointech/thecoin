import { GetDepositsToProcess } from './service'
import { ConfigStore } from '@the-coin/store';
import { init, release } from '@the-coin/utilities/firestore/jestutils';
import { PurchaseType } from '@the-coin/tx-firestore';

jest.unmock("googleapis")

jest.disableAutomock()

const IsManualRun = process.argv.find(v => v === "--testNamePattern") !== undefined

beforeAll(async () => {
  const timeout = 30 * 60 * 1000;
  jest.setTimeout(timeout);
  ConfigStore.initialize();
  await init('broker-cad');
});

afterAll(() => {
  ConfigStore.release();
  release();
});

it('We have valid deposits', async () => {

  if (!IsManualRun)
    return;

  const deposits = await GetDepositsToProcess();
  expect(deposits).not.toBeUndefined();

  for (const deposit of deposits) {
    console.log(`Deposit from: ${deposit.etransfer.name} - ${deposit.etransfer.recieved?.toSQLDate()}`);
    const { record } = deposit;
    expect(record.type).toBe(PurchaseType.etransfer);
    expect(record.fiatDisbursed).toBeGreaterThan(0);
    expect(record.transfer.value).toBeGreaterThan(0);
    expect(record.recievedTimestamp).toBeTruthy();
    expect(record.processedTimestamp).toBeTruthy();
    expect(record.completedTimestamp).toBeUndefined();
  }
})
