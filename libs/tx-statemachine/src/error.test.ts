import { jest } from '@jest/globals'
import { GetContract } from '@thecointech/contract-core';
import { getFirestore } from "@thecointech/firestore";
import { init } from '@thecointech/firestore';
import Decimal from 'decimal.js-light';
import { DateTime } from 'luxon';
import { getCurrentState, StateGraph } from './types';
import { manualOverride, manualOverrideTransition } from './transitions/manualOverride';
import type { ActionType, BuyAction } from '@thecointech/broker-db';
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
const noop = makeTransition("noop", async () => transitionBase('noop'));

// Simulate an error occuring
let shouldError = true;
const maybeError = makeTransition("maybeError", async () => {
  if (shouldError) {
    log.error("An error occurs");
    return {
      ...transitionBase("maybeError"),
      error: "An error occurs",
    }
  }
  return transitionBase("maybeError");
});

type States = "initial"|"testError"|"error"|"complete";

const graph : StateGraph<States, ActionType> = {
  initial: {
    // An error occurs when running the a transition
    next: FSM.transitionTo<States>(maybeError, "testError"),
  },
  testError: {
    next:  FSM.transitionTo<States>(noop, "complete"),
    onError: FSM.transitionTo<States>(noop, "error"),
  },
  error: { next: manualOverride },
  complete: null,
}

it("Error replay is handled appropriately", async () => {

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

  const runTest = async (expectedState: States, executedTransitions: number, numErrors: number, breakAt?: States) => {

    jest.resetAllMocks();
    const container = await processor.execute(null, action, breakAt);

      // On first run, we should stop on withCoin (it has no transitions)
    // This should result in 2 transitions.
    expect(Transactions.storeTransition).toHaveBeenCalledTimes(executedTransitions);
    expect(log.error).toHaveBeenCalledTimes(numErrors);

    const result1 = getCurrentState(container);
    expect(result1.name).toEqual(expectedState);

    // Reset our history (don't use DB, mocked DB can't simulate this)
    action.history = container.history.slice(1).map(h => h.delta);
    return container;
  }

  // The first run hits error
  await runTest('error', 2, 1);
  // Replay does the same thing
  await runTest('error', 0, 0);

  // Manually push a new state onto the stack
  // This is the equivalent of storeTransition in ManualOverride.tsx
  action.history.push(manualOverrideTransition("initial"));

  // Same error occurs, we haven't actually fixed it.
  await runTest('error', 2, 1);
  // Fix the error
  shouldError = false;
  // Re-running changes nothing, because all entries are replayed
  await runTest('error', 0, 0);

  // Manually restart again.  This time the issue is fixed.
  action.history.push(manualOverrideTransition("initial"));

  // Should now complete
  const container = await runTest('complete', 2, 0);
  // 2 failure, 1 success * 3 states === a total history of 9.
  expect(container.history.length === 9)
})
