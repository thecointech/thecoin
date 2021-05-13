import { ActionType, BuyAction } from '@thecointech/broker-db';
import * as Transactions from '@thecointech/broker-db/transaction';
import { GetContract } from '@thecointech/contract';
import { getFirestore } from "@thecointech/firestore";
import { init } from '@thecointech/firestore/mock';
import { log } from '@thecointech/logging';
import Decimal from 'decimal.js-light';
import { DateTime } from 'luxon';
import * as FSM from '.';
import { AnyActionContainer, StateGraph } from './types';

const getLast = (cont: AnyActionContainer) => cont.history.slice(-1)[0];
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
// breakHere returns null to simulate a transition that cannot complete (for reasons that are not an error)
const breakHere = async () => null;
// simulate adding data
const addFiat = async () => ({ ...transitionBase('addFiat'), fiat: new Decimal(10) })
const addCoin = async () => ({ ...transitionBase('addCoin'), coin: new Decimal(10), fiat: new Decimal(0) })
// Simulate an error occuring
const makeError = async () => ({ ...transitionBase('makeError'), error: "An error occurs" })
const logSuccess = async (cont: AnyActionContainer) => { log.trace(getLast(cont).data.meta!); return transitionBase('logSuccess'); }
const logError = async (cont: AnyActionContainer) => { log.warn(getLast(cont).data.error!); return transitionBase('logError'); }

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
  error: null,
  complete: null,
}

it("Processes and repeats a list of events", async () => {

  const spyOnRunTransitions = jest.spyOn(Transactions, 'storeTransition');
  const spyOnLogError = jest.spyOn(log, 'error');

  // Log nothing
  log.level(100);
  init({})
  const contract = await GetContract();
  const processor = new FSM.StateMachineProcessor(graph, contract);

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
    const container = await processor.execute({}, action, breakAt);

      // On first run, we should stop on withCoin (it has no transitions)
    // This should result in 2 transitions.
    expect(spyOnRunTransitions).toHaveBeenCalledTimes(executedTransitions);
    expect(spyOnLogError).toHaveBeenCalledTimes(numErrors);

    const result1 = getLast(container);
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
  // We still log the error,
  await runTest('finalize', 0, 2);

  // We can handle an error with an appropriate transition
  graph.finalize.onError = FSM.transitionTo<States>(logError, "error"),
  await runTest('error', 1, 1);

  // No errors, re-run the entire thing
  graph.withCoin.next = FSM.transitionTo<States>(noop, "finalize");
  action.history = [];
  await runTest('complete', 4, 0);

  // Does it break & resume properly?
  action.history = [];
  await runTest('withCoin', 2, 0, "withCoin");
  await runTest('complete', 2, 0);
})
