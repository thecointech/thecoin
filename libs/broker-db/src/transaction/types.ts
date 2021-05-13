import { CertifiedTransferRequest } from "@thecointech/types";
import { DateTime } from 'luxon';
import { Decimal } from 'decimal.js-light';
import { DocumentReference } from "@thecointech/firestore";

export type EncryptedPacket = {
  encryptedPacket: string;
  version: string;
}

export type CertifiedTransfer = {
  transfer: CertifiedTransferRequest;
  instructionPacket: EncryptedPacket;
  signature: string;
}

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
  date: DateTime;
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
    }
  } & BaseActionData;
  Sell: { initial: CertifiedTransfer } & BaseActionData;
  Bill: { initial: CertifiedTransfer } & BaseActionData;
}
export type ActionType = keyof ActionDataTypes;
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
export type AnyAction = TypedAction<ActionType>;

// Store a mapping of address => Actions[]
export type ActionDictionary<Type extends ActionType> = { [address: string]: TypedAction<Type>[] }

