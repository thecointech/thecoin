import {fetchActionsToComplete, getInstructions, processUnsettledETransfers } from './service'
import { init } from '@the-coin/utilities/firestore';
import { RbcApi } from "@the-coin/rbcapi";
import { ConfigStore } from '@the-coin/store';

import data from './service.test.mockdb.json';

beforeAll(() => {
  jest.setTimeout(90000000);
  ConfigStore.initialize();
})
afterAll(() => {
  ConfigStore.release();
})
beforeEach(async () => {

});

it('Can fetch Actions', async ()=> {

  await init(data);

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

  await init(data);
  const toComplete = await processUnsettledETransfers(new RbcApi());

  for (const record of toComplete)
  {
    expect(record.confirmation).toBeGreaterThan(0);
    expect(record.fiatDisbursed).toBeGreaterThan(0);
  }
})
