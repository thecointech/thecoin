import * as BrokerDB from '@thecointech/broker-db';
import { GetContract } from '@thecointech/contract';
import { getFirestore } from "@thecointech/firestore";
import { init } from '@thecointech/firestore/mock';
import { log } from '@thecointech/logging';
import Decimal from 'decimal.js-light';
import { DateTime } from 'luxon';
import * as FSM from '.';
import { ActionContainer, StateData } from './types';

const getLast = (cont: ActionContainer) => cont.history.slice(-1)[0];
const transitionBase = (type: string) =>({
  timestamp: DateTime.now(),
  type,
  // Reset errors/meta
  error: undefined,
  meta: undefined,
});
const noop = async () => transitionBase('noop');
const breakHere = async () => null;
const addFiat = async () => ({ ...transitionBase('addFiat'), fiat: new Decimal(10) })
const addCoin = async () => ({ ...transitionBase('addCoin'), coin: new Decimal(10) })
const makeError = async () => ({ ...transitionBase('makeError'), error: "An error occurs" })
const logSuccess = async (cont: ActionContainer) => { log.trace(getLast(cont).data.meta!); return transitionBase('logSuccess'); }
const logError = async (cont: ActionContainer) => { log.warn(getLast(cont).data.error!); return transitionBase('logError'); }

type States = "initial"|"withFiat"|"withCoin"|"finalize"|"error"|"complete";

const graph : FSM.StateGraph<States> = {
  initial: {
    next: FSM.transitionTo(addFiat, "withFiat"),
  },
  withFiat: {
    next: FSM.transitionTo(breakHere, "withCoin"),
  },
  withCoin: null, // This is an error
  finalize: {
    next: FSM.transitionTo(logSuccess, "complete"),
  },
  error: {
    // No clean up, simply forward to complete
    next: FSM.transitionTo(noop, 'complete'),
  },
  complete: null,
}

it("Processes and repeats a list of events", async () => {

  const spyOnRunTransitions = spyOn(BrokerDB, 'storeTransition');
  const spyOnLogError = spyOn(log, 'error');

  // Log nothing
  log.level(100);
  init({})
  const contract = await GetContract();
  const processor = new FSM.StateMachineProcessor(graph, contract);

  const action: BrokerDB.BaseAction = {
    data: {
      initial: {},
      initialId: "1234",
      timestamp: DateTime.now(),
    },
    history: [],
    doc: getFirestore().doc("/Buy/1234"),
  }

  const expectedValues: StateData = {
    fiat: new Decimal(0),
    coin: new Decimal(0),
  }

  const runTest = async (expectedState: States, executedTransitions: number, numErrors: number) => {

    spyOnRunTransitions.calls.reset();
    spyOnLogError.calls.reset();
    const container = await processor.execute({}, action);

      // On first run, we should stop on withCoin (it has no transitions)
    // This should result in 2 transitions.
    expect(spyOnRunTransitions).toHaveBeenCalledTimes(executedTransitions);
    expect(spyOnLogError).toHaveBeenCalledTimes(numErrors);

    const result1 = getLast(container);
    expect(result1.state).toEqual(expectedState);
    expect(result1.data.coin.toNumber()).toEqual(expectedValues.coin.toNumber());
    expect(result1.data.fiat.toNumber()).toBe(expectedValues.fiat.toNumber());

    // Reset our history (don't use DB, mocked DB can't simulate this)
    action.history = container.history.slice(1).map(h => h.delta);
  }

  // On first run, we should stop on withFiat.  The next transition does not complete
  // This is perfectly legal (and to be expected on a sale etc)
  expectedValues.fiat = new Decimal(10);
  await runTest('withFiat', 1, 0);

  // Simulate now successfully converting to coin, but has graph error
  // This should result in 2 transitions.
  graph.withFiat!.next = FSM.transitionTo(addCoin, "withCoin")
  expectedValues.coin = new Decimal(10);
  await runTest('withCoin', 1, 1);
  // Re-run, we should get the same result, but no transitions executed
  await runTest('withCoin', 0, 1);

  // Simulate transition error
  graph.withCoin = { next: FSM.transitionTo(makeError, "finalize") };
  await runTest('finalize', 1, 1);
  // We still log the error,
  await runTest('finalize', 0, 1);

  // We can handle an error with an appropriate transition
  graph.finalize!.onError = FSM.transitionTo(logError, "error"),
  await runTest('complete', 2, 0);

  // No errors, re-run the entire thing
  graph.withCoin!.next = FSM.transitionTo(noop, "finalize");
  action.history = [];
  await runTest('complete', 4, 0);
})
