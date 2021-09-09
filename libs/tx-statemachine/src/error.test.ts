import { ActionType, BuyAction } from '@thecointech/broker-db';
import * as Transactions from '@thecointech/broker-db/transaction';
import { GetContract } from '@thecointech/contract';
import { getFirestore } from "@thecointech/firestore";
import { init } from '@thecointech/firestore';
import { log } from '@thecointech/logging';
import Decimal from 'decimal.js-light';
import { DateTime } from 'luxon';
import * as FSM from '.';
import { getCurrentState, StateGraph } from './types';
import { manualOverride, manualOverrideTransition } from './transitions/manualOverride';

const transitionBase = (type: string) =>({
  timestamp: DateTime.now(),
  type,
  // Reset errors/meta
  error: undefined,
  meta: undefined,
});
// Simple transitions just test the different kind of scenarios the FSM needs to process.
// noop - no change to data, just transition to a new state
const noop = async () => transitionBase('noop');

// Simulate an error occuring
let shouldError = true;
const maybeError = async () => ({
  ...transitionBase("maybeError"),
  ...(shouldError ? {error: "An error occurs" } : {})
})

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

  const spyOnRunTransitions = jest.spyOn(Transactions, 'storeTransition');
  const spyOnLogError = jest.spyOn(log, 'error');

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
    const container = await processor.execute({}, action, breakAt);

      // On first run, we should stop on withCoin (it has no transitions)
    // This should result in 2 transitions.
    expect(spyOnRunTransitions).toHaveBeenCalledTimes(executedTransitions);
    expect(spyOnLogError).toHaveBeenCalledTimes(numErrors);

    const result1 = getCurrentState(container);
    expect(result1.name).toEqual(expectedState);

    // Reset our history (don't use DB, mocked DB can't simulate this)
    action.history = container.history.slice(1).map(h => h.delta);
    return container;
  }

  // The first run hits error
  await runTest('error', 2, 1);
  // Replay does the same thing
  await runTest('error', 0, 1);

  // Manually push a new state onto the stack
  // This is the equivalent of storeTransition in ManualOverride.tsx
  action.history.push(manualOverrideTransition("initial"));

  // Same error occurs, we haven't actually fixed it.
  await runTest('error', 2, 2);
  // Fix the error
  shouldError = false;
  // Re-running changes nothing, because all entries are replayed
  await runTest('error', 0, 2);

  // Manually restart again.  This time the issue is fixed.
  action.history.push(manualOverrideTransition("initial"));

  // Should now complete
  const container = await runTest('complete', 2, 2);
  // 2 failure, 1 success * 3 states === a total history of 9.
  expect(container.history.length === 9)
})
