//
// On error, we allow a manual transition to any existing state
import { ActionType } from '@thecointech/broker-db'
import { log } from '@thecointech/logging';
import { DateTime } from 'luxon';
import { Transition } from '../types.js'

export const manualOverride: Transition<any, ActionType> = async (container, currentState, replay?) => {
  // A manual transition cannot be run automatically.  It can
  // only be added directly using the admin app.
  if (!replay) {
    return null;
  }
  const nextState = replay.meta;

  log.trace({ initialId: container.action.data.initialId, state: nextState, transition: "manualOverride", replay: true },
    `(replay: {replay}): {initialId} doing manual transition via {transition} to state {state}`);

  return {
    name: nextState,
    delta: replay,
    data: {
      ...currentState.data,
      ...replay,
    }
  }
}

export const manualOverrideTransition = (newState: string) => ({
  created: DateTime.now(),
  meta: newState,
  type: "manualOverride",
})
