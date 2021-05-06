import { BaseAction, TransitionDelta, storeTransition } from "@thecointech/broker-db";
import { log } from "@thecointech/logging";
import { Decimal } from "decimal.js-light";
import { DateTime } from "luxon";
import { ActionContainer, StateSnapshot, TransitionCallback } from "./types";
import { TheCoin } from '@thecointech/contract';
//
// Execute the transition. If we recieve a result, store it in the DB
async function runAndStoreTransition(container: ActionContainer, transition: TransitionCallback) : Promise<TransitionDelta|null> {
  log.trace({ transition: transition.name, initialId: container.action.data.initialId },
    `Calculating transition {transition} for {initialId}`);

  const delta = await transition(container);
  // If we have a null response, transition did not complete
  if (!delta)
    return null;

  // Ensure required values
  const withMeta = {
    timestamp: DateTime.now(),
    type: transition.name,
    ...delta
  }

  log.trace({ delta, transition: transition.name, initialId: container.action.data.initialId },
    `Storing delta {delta} for transition {transition} for {initialId}`);

  // Store the output in the cloud to allow replaying
  // the transition without executing it
  await storeTransition(container.action.doc, withMeta);
  return withMeta;
}

//
// Builds a simple reducer function.  Takes current state, and (optionally) next delta.
// If no delta exists, run the transition to create it.  Finally, merge the delta
// into current state and return new currentState
export function transitionTo(transition: TransitionCallback, nextState: string) {

  return async (container: ActionContainer, currentState: StateSnapshot, replay?: TransitionDelta): Promise<StateSnapshot | null> => {

    // ensure that our transition matches the one being replayed.
    if (replay && transition.name != replay.type) {
      throw new Error('Replay event does not match next transition');
    }
    const delta = replay ?? await runAndStoreTransition(container, transition);
    return delta
      ? {
        state: nextState,
        delta,
        data: {
          ...currentState.data,
          ...delta,
        }
      }
      : null;
  }
}

type Transition = ReturnType<typeof transitionTo>;
export type StateTransitions = {
  next: Transition,
  onError?: Transition,
  onTimeout?: Transition,
} | null;

type RequiredStates = "initial" | "complete";
export type StateGraph<States extends string> = {
  initial: StateTransitions,
  complete: null,
} & Record<States, StateTransitions>;

export class StateMachineProcessor<States extends RequiredStates> {

  graph: StateGraph<States>;
  contract: TheCoin;

  constructor(graph: StateGraph<States>, contract: TheCoin) {
    this.graph = graph;
    this.contract = contract;
  }

  // Every graph execution starts in the initial state.
  readonly initialState: StateSnapshot<States> = {
    state: "initial" as States,
    data: {
      fiat: new Decimal(0),
      coin: new Decimal(0),
    },
    delta: {} as any,
  }

  async execute(source: unknown, action: BaseAction) {

    // We always start in the initial state with zero'ed entries
    let currentState = this.initialState;
    // Create a new empty container to hold the processed data
    const container: ActionContainer = {
      source,
      action,
      history: [currentState],
      contract: this.contract,
    }

    // Duplicate the stored events.  We want to replay the list (but do
    // not want to modify the original list.)
    const priorTransitions = [...container.action.history];

    // Now, execute the graph till we are all done
    while (currentState.state != 'complete') {
      const { state } = currentState;
      const { initialId } = action.data;
      const transitions = this.graph[state];

      log.trace({ initialId, state }, `Action {initialId} processing state: {state}`);

      // If no transitions registered, we cannot continue.  This should never happen
      if (!transitions) {
        log.error({ state }, `Entered state {state} with no transitions - can not complete action: ${action.doc.path}`);
        break;
      }

      // Have we timed out?
      let timeout = false;
      let nextState: StateSnapshot | null = null;
      const replay = priorTransitions.shift();

      // If our last transition left an error state, what should we do?
      if (currentState.delta.error) {
        // Is an error handler registered for this state?
        if (transitions.onError) {
          nextState = await transitions.onError?.(container, currentState, replay);
        }
        else {
          log.error({ state }, `State {state} has error, but no error handler registered:\n${currentState.delta.error}`);
          break;
        }
        // what to do?
      }
      // If this transaction (as a whole) has timed-out.  Not related to timeout
      // of individual actions.  Probably should be calculated in runTransition though
      else if (timeout && transitions.onTimeout) {
        log.error({ initialId, state }, 'Action {initialId} timed out while in state: {state}');
        nextState = await transitions.onTimeout(container, currentState, replay);
      }
      else {
        // no problems, iterate to the next state
        nextState = await transitions.next(container, currentState, replay);
        log.trace({ initialId, state: nextState?.state, transition: transitions.next.name },
          `Action {initialId} transitioning via {transition} to state {state}`);
      }

      // If our transition has not generated a state for us, we break.
      // This can happen when a transition cannot be completed (eg, calling
      // tocoin before the tx has a chance to settle), but there is no error.
      if (!nextState) {
        log.debug({ initialId, state, transition: transitions.next.name },
          'Pausing action {initialId}: Transition {transition} did not generate a delta in state {state}');
        break;
      }

      container.history.push(nextState);
      currentState = nextState as StateSnapshot<States>;
    }

    return container;
  }
}
