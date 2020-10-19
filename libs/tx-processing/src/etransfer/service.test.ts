import { ConfigStore } from "@the-coin/store";
import { signIn } from "../firestore";
import {fetchActionsToComplete, getInstructions, processUnsettledETransfers } from './service'
import { log } from "@the-coin/logging";
import { init, describe, release } from '@the-coin/utilities/firestore/jestutils';
import { RbcApi } from "@the-coin/rbcapi";

beforeAll(async () => {
  const timeout = 30 * 60 * 1000;
  jest.setTimeout(timeout);
  ConfigStore.initialize();
  await signIn()
  await init("broker-cad");
});

afterAll(() => {
  ConfigStore.release();
  release();
});

describe("E2E eTransfers", () => {

  beforeAll(async () => {

    // Populate our DB with demo data
  })

  test('Can fetch Actions', async ()=> {
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

  test('Succesfully Processes Actions', async ()=> {
    try {
      const toComplete = await processUnsettledETransfers(new RbcApi());

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
})
