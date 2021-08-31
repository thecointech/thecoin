import { ActionType, TransitionDelta, TypedAction, StateData } from "@thecointech/broker-db";
import type { TheCoin } from "@thecointech/contract";
import type { eTransferData } from "@thecointech/tx-gmail";
import type { BillPayeePacket, ETransferPacket } from "@thecointech/types";
import type { RbcApi } from '@thecointech/rbcapi';

export type RequiredStates = "initial" | "complete" | "error";

export type StateSnapshot<States extends string> = {
  // name of the current state
  name: States,
  // results of the last transition taken to reach this state
  delta: TransitionDelta,
  // previous state merged with delta creates current state
  data: StateData,
}

export type Transition<States extends string, Type extends ActionType> = (container: TypedActionContainer<Type>, currentState: StateSnapshot<States>, replay?: TransitionDelta) => Promise<StateSnapshot<States> | null>
export type StateTransitions<States extends string, Type extends ActionType> = {
  next: Transition<States, Type>,
  onError?: Transition<States, Type>,
  onTimeout?: Transition<States, Type>,
};

export type StateGraph<States extends string, Type extends ActionType> =
  Omit<
    Record<States, StateTransitions<States, Type>>,
    "complete"|"error"
  > &
  {
    complete: null,
    error: null,
  };

export type InstructionDataTypes = {
  Buy: eTransferData;
  Sell: ETransferPacket;
  Bill: BillPayeePacket;
}

export interface TypedActionContainer<Type extends ActionType> {
  // The broker-db data structure representing current state
  action: TypedAction<Type>;
  // The transfer instructions (eg etransfer/BillPayment/withdrawal instructions).
  // This data is not included the DB.
  instructions: InstructionDataTypes[Type]|null;
  // Events applied to the action
  history: StateSnapshot<string>[],
  // contract any coin actions are executed against.
  contract: TheCoin,
  // Access to the bank (may be null)
  bank: RbcApi|null,
}

export type SellActionContainer = TypedActionContainer<"Sell">;
export type BuyActionContainer = TypedActionContainer<"Buy">;
export type BillActionContainer = TypedActionContainer<"Bill">;
export type AnyActionContainer = TypedActionContainer<ActionType>;

export type TransitionCallback<Type extends ActionType=ActionType> = (container: TypedActionContainer<Type>) => Promise<Partial<TransitionDelta> | null>;

// Handy utility function to get current state (last entry in the history)
export const getCurrentState = (container: AnyActionContainer) => container.history[container.history.length - 1];