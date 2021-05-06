import { getDepositsToProcess } from './service'
import { ConfigStore } from '@thecointech/store';
import { init, release } from '@thecointech/utilities/firestore/jestutils';
import { PurchaseType } from '@thecointech/tx-firestore';

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

  const deposits = await getDepositsToProcess();
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
