

import { ConfigStore } from "../store";
import { signIn } from "../utils/Firebase";
import {fetchActionsToComplete, getInstructions, processUnsettledETransfers } from './service'
import { log } from "../logging";

beforeAll(async () => {
  const timeout = 30 * 60 * 1000;
  jest.setTimeout(timeout);
  ConfigStore.initialize();

  await signIn()
});

afterAll(() => {
    ConfigStore.release();
});

test('Can fetch Actions', async ()=> {
  const toComplete = await fetchActionsToComplete();
  expect(toComplete).not.toBeUndefined();
  for (const record of toComplete)
  {
    expect(record.fiatDisbursed).toBeTruthy();
  }

  const instructions = await getInstructions(toComplete);

  expect(instructions.length).toBe(toComplete.length);
})

test('Succesfully Processes Actions', async ()=> {
  try {
    const toComplete = await processUnsettledETransfers();

    for (const record of toComplete)
    {
      expect(record.confirmed).toBeGreaterThan(0);
    }
  }
  catch(e)
  {
    log.error(e)
    fail();
  }
})
