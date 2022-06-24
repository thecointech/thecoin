import { TransitionDelta, storeTransition, ActionType, TypedAction } from "@thecointech/broker-db";
import { log } from "@thecointech/logging";
import { DateTime } from "luxon";
import { InstructionDataTypes, StateGraph, StateSnapshot, Transition, TransitionCallback, TypedActionContainer } from "./types";
import type { TheCoin } from '@thecointech/contract-core';
import type { IBank } from '@thecointech/bank-interface';
export * from './types';

//
// Execute the transition. If we recieve a result, store it in the DB
async function runAndStoreTransition<Type extends ActionType>(container: TypedActionContainer<Type>, transition: TransitionCallback<Type>) : Promise<TransitionDelta|null> {
  log.trace({ transition: transition.name, initialId: container.action.data.initialId },
    `Calculating transition {transition} for {initialId}`);

  let delta : Partial<TransitionDelta>|null = null;
  try {
    delta = await transition(container);
    // If we have a null response, transition did not complete
    if (!delta)
      return null;
  }
  catch (error: any) {
    // For any exception, we transition to an error state and await a manual fix.
    log.error({ transition: transition.name, initialId: container.action.data.initialId, error},
      "Error running {transition} on {initialId}: {error}");
    delta = { error: error.message }
  }


  // Ensure required values
  const withMeta = {
    // Init meta with now, but value will be
    // overwritten with server timestamp on submission
    created: DateTime.now(),
    type: transition.name,
    ...delta,
  }

  log.trace({ delta, transition: transition.name, initialId: container.action.data.initialId },
    `Storing delta {delta} for transition {transition} for {initialId}`);

  // Store the output in the cloud to allow replaying
  // the transition without executing it
  await storeTransition(container.action.doc as any, withMeta);
  return withMeta;
}

//
// Builds a simple reducer function.  Takes current state, and (optionally) next delta.
// If no delta exists, run the transition to create it.  Finally, merge the delta
// into current state and return new currentState
export function transitionTo<States extends string, Type extends ActionType=ActionType>(transition: TransitionCallback<Type>, nextState: States) : Transition<States, Type> {

  // ensure that our transition matches the one being replayed.
  if (transition.name == '' || transition.name == 'anonymous') {
    throw new Error('Transition must be created with name');
  }

  return async (container, currentState, replay?) => {
    if (replay) {
      //log.trace({ initialId: container.action.data.initialId, state: nextState, transition: transition.name, replay: true },
      //  `(replay: {replay}): {initialId} transitioning via {transition} to state {state}`);
    }
    else {
      log.debug({ initialId: container.action.data.initialId, state: nextState, transition: transition.name },
        `{initialId} transitioning via {transition} to state {state}`);
    }

    // ensure that our transition matches the one being replayed.
    if (replay && transition.name != replay.type) {
      // If this is an override, let it run through
      if (replay.type == "manualOverride") {
        log.info("Allowing Manual Override");
        return {
          name: replay.meta! as States,
          delta: replay,
          data: {
            ...currentState.data,
            ...replay,
          }
        }
      }
      throw new Error(`Replay event ${replay.type} does not match next transition ${transition.name}`);
    }
    const delta = replay ?? await runAndStoreTransition<Type>(container, transition);
    return delta
      ? {
        name: nextState,
        delta,
        data: {
          ...currentState.data,
          ...delta,
        }
      }
      : null;
  }
}

// Every graph execution starts in the initial state.
const initialState = <States extends string>(date: DateTime): StateSnapshot<States> => ({
  name: "initial" as States,
  data: {},
  delta: {
    type: "no prior state",
    created: date,
    date,
  },
})

export class StateMachineProcessor<States extends string, Type extends ActionType> {

  graph: StateGraph<States, Type>;
  contract: TheCoin;
  bank: IBank|null;

  constructor(graph: StateGraph<States, Type>, contract: TheCoin, bank: IBank|null) {
    this.graph = graph;
    this.bank = bank;
    this.contract = contract;
  }

  async execute(
      instructions: InstructionDataTypes[Type]|null,
      action: TypedAction<Type>,
      breakOnState?: States
    )
    : Promise<TypedActionContainer<Type>>
  {
    const { initialId } = action.data;
    log.debug({ initialId }, 'Begin processing action {initialId}')

    // We always start in the initial state with zero'ed entries
    let currentState = initialState<States>(action.data.date);
    // Create a new empty container to hold the processed data
    const container: TypedActionContainer<Type> = {
      instructions,
      action,
      history: [currentState],
      contract: this.contract,
      bank: this.bank,
    }

    // Duplicate the stored events.  We want to replay the list (but do
    // not want to modify the original list.)
    const priorTransitions = [...container.action.history];

    // Now, execute the graph till we are all done
    while (currentState.name != 'complete') {
      // Our meta-programming has passed typescripts limit: manually cast to get rid of false errors
      const state = currentState.name as keyof StateGraph<States, Type>;
      const transitions = this.graph[state];

      // Manual early-exit.  Online service explicitly breaks
      // execution early so it can return at the earliest possible moment
      if (state === breakOnState)
        break;

      log.trace({ initialId, state }, `Action {initialId} processing state: {state}`);

      // If no transitions registered, we cannot continue.  This should never happen
      if (!transitions) {
        log.error({ state }, `Entered state {state} with no transitions - can not complete action: ${action.doc.path}`);
        break;
      }

      // Have we timed out?
      let timeout = false;
      let nextState: StateSnapshot<States> | null = null;
      const replay = priorTransitions.shift();

      // If our last transition left an error state, what should we do?
      if (currentState.delta.error) {
        // Log every error.
        log.error({ state }, `Error occured on {state}, ${currentState.delta.error}`);
          // IF we have a handler, we continue processing
        if (transitions.onError) {
          nextState = await transitions.onError?.(container, currentState, replay);
        }
        else {
          log.error({ state }, `State {state} has error, but no error handler registered:\n${currentState.delta.error}`);
          break;
        }
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
      }

      // If our transition has not generated a state for us, we break.
      // This can happen when a transition cannot be completed (eg, calling
      // tocoin before the tx has a chance to settle), but there is no error.
      if (!nextState) {
        log.debug({ initialId, state },
          'Pausing action {initialId}: Last transition did not generate a delta in state {state}');
        break;
      }

      container.history.push(nextState);
      currentState = nextState as StateSnapshot<States>;
    }

    return container;
  }
}
