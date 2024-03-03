import { DateTime } from 'luxon';
import Decimal from 'decimal.js-light';
import { DocumentReference } from "@thecointech/firestore";
import type { CertifiedTransfer, UberTransferAction, AssignPluginRequest, RemovePluginRequest } from '@thecointech/types';

// Data definition for documents stored in
// /{action}/randomId.
export type IncompleteRef = {
  ref: DocumentReference<AnyActionData>;
}

// Changes applied to the action
export type StateData = {
  fiat?: Decimal;
  coin?: Decimal;
  hash?: string; // Most recent tx hash
  meta?: string; // Any metadata about this transition: eg confirmation numbers etc
  error?: string; // Any error data.  Could be merged into meta?
}

// The changes applied to an action
export type TransitionDelta = {
  // The date the transition was created.  May differ from
  // the applicable date of the action (eg, based on settlement dates etc)
  created: DateTime;
  // The date the action happened.  This will be different than
  // the created date.  For example, the recieved date for an
  // e-transfer will be different than when the action is created.
  // This date is primarily for reference, and not used internally
  date?: DateTime;
  // The type of transition (ie, describes the effects of the transition: toCoin etc)
  type: string;
} & StateData;

// An action stores very little data directly.
// Instead, it has an 'events' subcollection
// which is a record of all the state changes
// that have happened to the collection.
export type BaseActionData = {
  initial: unknown,
  date: DateTime;
  initialId: string
}

export type PurchaseType = "etransfer"|"deposit"|"other";
export type ActionDataTypes = {
  Buy: {
    initial: {
      amount: Decimal;
      type: PurchaseType;
      // NOTE: raw is filled out on the server and is
      // never to be persisted to the DB
      raw?: any;
    }
  } & BaseActionData;
  Sell: { initial: CertifiedTransfer } & BaseActionData;
  Bill: { initial: CertifiedTransfer | UberTransferAction } & BaseActionData;
  Plugin:  { initial: AssignPluginRequest | RemovePluginRequest } & BaseActionData;

  // Not an action, but lets store it here anyway
  Heartbeat: {
    date: DateTime;
    result: string;
    // Not currently used
    initialId?: unknown;
    initial?: unknown;
  }
}
export type ActionType = keyof ActionDataTypes;
export type TxActionType = "Buy" | "Sell" | "Bill" | "Plugin";
export type AnyActionData = ActionDataTypes[ActionType];

// A structure encompassing all the data related to an action
// Includes both root document and stream documents
export interface TypedAction<Type extends ActionType> {
  // Ethereum address of the user
  address: string;
  // Kind of action
  type: Type,
  // Initial data stored in DB. Has no processing applied.
  data: ActionDataTypes[Type],
  // Transitions that have been applied to this action.
  history: TransitionDelta[],
  // The firestore document that data came from
  doc: DocumentReference<ActionDataTypes[Type]>,
}

export type SellAction = TypedAction<'Sell'>;
export type BuyAction = TypedAction<'Buy'>;
export type BillAction = TypedAction<'Bill'>;
export type PluginAction = TypedAction<'Plugin'>;
export type AnyAction = TypedAction<ActionType>;
export type AnyTxAction = TypedAction<TxActionType>;

// Store a mapping of address => Actions[]
export type ActionDictionary<Type extends ActionType> = Record<string, TypedAction<Type>[]>;

export function isType<Type extends ActionType>(action: AnyAction, type: Type): action is TypedAction<Type> {
  return action.type === type;
}
