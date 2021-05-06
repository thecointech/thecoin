import { BaseAction, TransitionDelta } from "@thecointech/broker-db";
import { TheCoin } from "@thecointech/contract";
import { Decimal } from "decimal.js-light";

export type RequiredStates = "initial" | "complete" | "error";

// The mutable elements of our state.
export type StateData = {
  fiat: Decimal,
  coin: Decimal,
  // metadata set by the last transition
  meta?: string;
  // Error message set by the last transition
  error?: string,
}

export type StateSnapshot<States extends string> = {
  // name of the current state
  state: States,
  // results of the last transition taken to reach this state
  delta: TransitionDelta,
  // current state
  data: StateData,
}

export type Transition<States extends string=string> = (container: ActionContainer, currentState: StateSnapshot<States>, replay?: TransitionDelta) => Promise<StateSnapshot<States> | null>
export type StateTransitions<States extends string> = {
  next: Transition<States>,
  onError?: Transition<States>,
  onTimeout?: Transition<States>,
};

export type StateGraph<States extends string> =
  Omit<
    Record<States, StateTransitions<States>>,
    "complete"|"error"
  > &
  //Record<States, StateTransitions<States>> &
  {
    complete: null,
    error: null,
  };

export type ActionContainer = {
  // The source data used to initiate this action (eg eTransfer, CertifiedTransfer etc)
  source: unknown,
  // The broker-db data structure representing current state
  action: BaseAction,
  // Events applied to the action
  history: StateSnapshot<string>[],
  // contract any coin actions are executed against.
  contract: TheCoin,
}

export type TransitionCallback = (container: ActionContainer) => Promise<Partial<TransitionDelta> | null>;

// Handy utility function to get current state (last entry in the history)
export const getCurrentState = (container: ActionContainer) => container.history[container.history.length - 1];
