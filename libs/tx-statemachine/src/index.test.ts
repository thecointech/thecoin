import { jest } from '@jest/globals';
import { ActionType, BuyAction } from '@thecointech/broker-db';
import { GetContract } from '@thecointech/contract-core';
import { getFirestore } from "@thecointech/firestore";
import { init } from '@thecointech/firestore';
import Decimal from 'decimal.js-light';
import { DateTime } from 'luxon';
import { AnyActionContainer, getCurrentState, StateGraph } from './types';
import { manualOverride } from './transitions/manualOverride';
import * as brokerDbTxs from '@thecointech/broker-db/transaction';
import { makeTransition } from './makeTransition';

jest.unstable_mockModule('@thecointech/broker-db/transaction', () => {
  // const module = await import('@thecointech/broker-db/transaction');
  return Object.keys(brokerDbTxs).reduce((acc, key) => ({ ...acc, [key]: jest.fn() }), {});
});
jest.unstable_mockModule('@thecointech/logging', () => ({
  log: {
    debug: jest.fn(),
    info: jest.fn(),
    trace: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }
}));
const { log } = await import('@thecointech/logging');
const Transactions = await import('@thecointech/broker-db/transaction');
const FSM = await import('.');

const transitionBase = (type: string) =>({
  timestamp: DateTime.now(),
  type,
  // Reset errors/meta
  error: undefined,
  meta: undefined,
});
// Simple transitions just test the different kind of scenarios the FSM needs to process.
// noop - no change to data, just transition to a new state
const noop = makeTransition('noop', async () => transitionBase('noop'));
// breakHere returns null to simulate a transition that cannot complete (for reasons that are not an error)
const breakHere = makeTransition('breakHere', async () => null);
// simulate adding data
const addFiat = makeTransition('addFiat', async () => ({ ...transitionBase('addFiat'), fiat: new Decimal(10) }));
const addCoin = makeTransition('addCoin', async () => ({ ...transitionBase('addCoin'), coin: new Decimal(10), fiat: new Decimal(0) }));
// Simulate an error occuring
const makeError = makeTransition('makeError', async () => ({ ...transitionBase('makeError'), error: "An error occurs" }));
const logSuccess = makeTransition('logSuccess', async (cont) => { log.trace(getCurrentState(cont).data.meta!); return transitionBase('logSuccess'); });
const logError = makeTransition('logError', async (cont) => { log.warn(getCurrentState(cont).data.error!); return transitionBase('logError'); });

type States = "initial"|"withFiat"|"withCoin"|"finalize"|"error"|"complete";

const graph : StateGraph<States, ActionType> = {
  initial: {
    next: FSM.transitionTo<States>(addFiat, "withFiat"),
  },
  withFiat: {
    next: FSM.transitionTo<States>(breakHere, "withCoin"),
  },
  withCoin: {
    next: FSM.transitionTo<States>(breakHere, "finalize"),
  },
  finalize: {
    next: FSM.transitionTo<States>(logSuccess, "complete"),
  },
  error: { next: manualOverride },
  complete: null,
}

it("Pauses and resumes running a processing graph on an action", async () => {

  // const spyOnRunTransitions = jest.spyOn(Transactions, 'storeTransition');
  // const spyOnLogError = jest.spyOn(log, 'error');
  init({})
  const contract = await GetContract();
  const processor = new FSM.StateMachineProcessor(graph, contract, null);

  const action: BuyAction = {
    address: "0x123",
    type: "Buy",
    data: {
      initial: {
        amount: new Decimal(100),
        type: "other",
      },
      initialId: "1234",
      date: DateTime.now(),
    },
    history: [],
    doc: getFirestore().doc("/Buy/1234") as unknown as BuyAction["doc"],
  }

  const expectedValues = {
    fiat: undefined as undefined|Decimal,
    coin: undefined as undefined|Decimal,
  }

  const runTest = async (expectedState: States, executedTransitions: number, numErrors: number, breakAt?: States) => {

    jest.resetAllMocks();
    const container = await processor.execute(null, action, breakAt);

      // On first run, we should stop on withCoin (it has no transitions)
    // This should result in 2 transitions.
    expect(Transactions.storeTransition).toHaveBeenCalledTimes(executedTransitions);
    expect(log.error).toHaveBeenCalledTimes(numErrors);

    const result1 = getCurrentState(container);
    expect(result1.name).toEqual(expectedState);
    expect(result1.data.coin?.toNumber()).toEqual(expectedValues.coin?.toNumber());
    expect(result1.data.fiat?.toNumber()).toBe(expectedValues.fiat?.toNumber());

    // Reset our history (don't use DB, mocked DB can't simulate this)
    action.history = container.history.slice(1).map(h => h.delta);
  }

  // On first run, we should stop on withFiat.  The next transition does not complete
  // This is perfectly legal (and to be expected on a sale etc)
  expectedValues.fiat = new Decimal(10);
  await runTest('withFiat', 1, 0);

  // Now allow converting to coin
  graph.withFiat.next = FSM.transitionTo<States>(addCoin, "withCoin")
  expectedValues.coin = new Decimal(10);
  expectedValues.fiat = new Decimal(0);
  await runTest('withCoin', 1, 0);
  // Re-run, we should get the same result, but no transitions executed
  await runTest('withCoin', 0, 0);

  // Simulate transition error
  graph.withCoin = { next: FSM.transitionTo<States>(makeError, "finalize") };
  await runTest('finalize', 1, 2);
  // We still log an error because there is no error-handling
  await runTest('finalize', 0, 1);

  // We can handle an error with an appropriate transition
  graph.finalize.onError = FSM.transitionTo<States>(logError, "error"),
  await runTest('error', 1, 0);

  // No errors, re-run the entire thing
  graph.withCoin.next = FSM.transitionTo<States>(noop, "finalize");
  action.history = [];
  await runTest('complete', 4, 0);

  // Does it break & resume properly?
  action.history = [];
  await runTest('withCoin', 2, 0, "withCoin");
  await runTest('complete', 2, 0);
})
