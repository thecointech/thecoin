import {fetchActionsToComplete, getInstructions, processUnsettledETransfers } from './service'
import { init } from '@the-coin/utilities/firestore/mock';
import { RbcApi } from "@the-coin/rbcapi";
import data from './service.test.mockdb.json';
import { ConfigStore } from '@the-coin/store';

beforeAll(() => {
  jest.setTimeout(90000000);
  ConfigStore.initialize();
})
afterAll(() => {
  ConfigStore.release();
})
beforeEach(async () => {
  await init(data);
});

it('Can fetch Actions', async ()=> {
  const toComplete = await fetchActionsToComplete();
  expect(toComplete).not.toBeUndefined();
  for (const record of toComplete)
  {
    expect(record).toBeTruthy();
    expect(record.confirmation).toBeUndefined();
    expect(record.completedTimestamp).toBeUndefined();
  }

  const instructions = await getInstructions(toComplete);

  expect(instructions.length).toBe(toComplete.length);
})

it('Succesfully Processes Actions', async ()=> {
  const toComplete = await processUnsettledETransfers(new RbcApi());

  for (const record of toComplete)
  {
    expect(record.confirmation).toBeGreaterThan(0);
    expect(record.fiatDisbursed).toBeGreaterThan(0);
  }
})
