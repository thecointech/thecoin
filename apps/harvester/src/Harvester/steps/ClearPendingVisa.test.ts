import { jest } from '@jest/globals';
import currency from 'currency.js';
import { HarvestData, HarvestDelta } from '../types';
import { DateTime } from 'luxon';
import { log } from '@thecointech/logging';
import { Wallet } from 'ethers';

jest.unstable_mockModule('../notify', () => ({
  notify: jest.fn(),
}));
const notify = await import('../notify');
const { ClearPendingVisa } = await import('./ClearPendingVisa')
it ('clearsPending using visa history', async () => {

  const logStatements: string[] = [];
  log.info = jest.fn<(...args: any[]) => boolean>().mockImplementation((args) => {
    logStatements.push(args);
    return false;
  });

  const clearPending = new ClearPendingVisa();
  const {state, user} = getData();

  const d1 = await clearPending.process(state, user);
  expect(d1.harvesterBalance).toEqual(currency(500));
  expect(logStatements.length).toEqual(0); // did nothing

  state.state.toPayVisa = currency(10);
  const d2 = await clearPending.process(state, user);
  expect(d2.harvesterBalance).toEqual(currency(500));
  expect(logStatements[0]).toContain("Cannot settle before"); // did nothing

  state.state.toPayVisaDate = DateTime.now().minus({ days: 1 });
  const d3 = await clearPending.process(state, user);
  expect(d3.harvesterBalance).toEqual(currency(500));
  expect(logStatements[1]).toContain("Found 0 txs");
  expect(logStatements[2]).toContain("still waiting for pending payment"); // did nothing

  // Log some dummy transactions
  state.visa.txs = [{
    values: [currency(10)],
    date: DateTime.now().minus({ days: 2 }), // invalid, happens prior to settlement
  }, {
    values: [currency(0)],
    date: DateTime.now(),
  }, {
    values: [currency(5)],
    date: DateTime.now(),
  }]

  const d4 = await clearPending.process(state, user);
  expect(d4.harvesterBalance).toEqual(currency(500));
  expect(logStatements[3]).toContain("Found 2 txs");
  expect(logStatements[4]).toContain("still waiting for pending payment"); // did nothing

  state.visa.txs?.push({
    values: [currency(10)],
    date: DateTime.now(),
  })

  const d5 = await clearPending.process(state, user);
  expect(d5.harvesterBalance).toEqual(currency(490));
  expect(d5.toPayVisa).toBeUndefined();
  expect(d5.toPayVisaDate).toBeUndefined();
  expect(logStatements[5]).toContain("Found 3 txs");
  expect(logStatements[6]).toContain("Found matching credit for pending payment"); // did nothing
})

it("clearsPending when timed out", async () => {
  const { state, user } = getData({ state: {
    toPayVisaDate: DateTime.now().minus({ days: 7 }),
    toPayVisa: currency(100),
  } });

  const clearPending = new ClearPendingVisa();
  const d5 = await clearPending.process(state, user);
  expect(d5.harvesterBalance).toEqual(currency(400));
})

it("notifies if insufficient balance", async () => {
  const { state, user } = getData({ state: {
    toPayVisaDate: DateTime.now().plus({ days: 1 }),
    toPayVisa: currency(3000),
  }})

  const clearPending = new ClearPendingVisa();
  const d5 = await clearPending.process(state, user);
  expect(notify.notify).toHaveBeenCalled();
})

const getData = (args: { state?: Partial<HarvestDelta> } = {}) => ({
  state: {
    visa: {
      balance: currency(500),
      history: [],
    },
    delta: [],
    state: {
      toPayVisa: currency(0),
      toPayVisaDate: DateTime.now().plus({ days: 1 }),
      harvesterBalance: currency(500),
      ...args.state
    },
  } as unknown as HarvestData,
  user: {
    wallet: Wallet.createRandom(),
  } as any
})
