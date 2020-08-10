import { ConfigStore } from "@the-coin/store";
import { signIn } from "../firestore";
import {fetchActionsToComplete, getInstructions, processUnsettledETransfers } from './service'
import { log } from "@the-coin/logging";

beforeAll(async () => {
  const timeout = 30 * 60 * 1000;
  jest.setTimeout(timeout);
  ConfigStore.initialize();
  await signIn()
});

afterAll(() => {
    ConfigStore.release();
});

test.skip('Can fetch Actions', async ()=> {
  const toComplete = await fetchActionsToComplete();
  expect(toComplete).not.toBeUndefined();
  for (const record of toComplete)
  {
    expect(record).toBeTruthy();
    expect(record.fiatDisbursed).toBe(0);
  }

  const instructions = await getInstructions(toComplete);

  expect(instructions.length).toBe(toComplete.length);
})

test.skip('Succesfully Processes Actions', async ()=> {
  try {
    const toComplete = await processUnsettledETransfers();

    for (const record of toComplete)
    {
      expect(record.confirmation).toBeGreaterThan(0);
    }
  }
  catch(e)
  {
    log.error(e)
    fail();
  }
})
