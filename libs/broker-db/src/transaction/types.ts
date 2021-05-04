import { CertifiedTransferRequest, DocumentReference } from "@thecointech/types";
import { DateTime } from 'luxon';
import { Decimal } from 'decimal.js-light';

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
  ref: string;
}

// Transaction State is the state acted on
// by the processing state machine.
// export type TransactionState = {
// }

// type EventDataMapping = {
//   tocoin: Decimal;
//   tofiat: Decimal;
//   pretransfer: "send"|"recieve";
//   transfer: string; // Transfer value to/from client
//   //sendto: string;   // Send value (TC or Cash) to client - store hash or confirm,
//   //recievefrom: string; // Recieve value (TC or Cash) from client - store hash or confirm,
//   // sendfiat: string;     // Send e-Transfer to client: store confirmation number
//   // sendtc: string;       // Send TC to client: store hash
//   refund: string;
//   completed: string;
// }

// export type EventType = keyof EventDataMapping;

// The updateable properties of a transaction.

// The change to values from running a transition
export type TransitionDelta = {
  timestamp: DateTime;
  type: string;

  fiat?: Decimal;
  coin?: Decimal;
  meta?: string; // Any metadata about this transition: eg confirmation numbers etc
  error?: string; // Any error data.  Could be merged into meta?
}

// export interface TypedEvent<TypeName extends EventType>  extends TransitionEvent {
//   type: TypeName; // Override type with explicit value
// }

// export type ToCoinEvent = TypedEvent<"tocoin">;
// export type PreTransferEvent = TypedEvent<"pretransfer">;
// // export type FiatTransferEvent = TypedEvent<"confirmfiat">;
// // export type CoinTransferEvent = TypedEvent<"confirmtc">;
// export type CompletedEvent = TypedEvent<"completed">;
// export type AnyEvent = TransitionEvent;

// export const isEventType = <Type extends EventType>(type: Type, event?: AnyEvent, )
//   : event is TypedEvent<Type> => event?.type === type;

// export type ProcessRecord = {
//   recievedTimestamp: Timestamp,
//   processedTimestamp?: Timestamp,
//   completedTimestamp?: Timestamp,
//   hash: string,
//   hashRefund?: string,
//   confirmed: boolean,
//   fiatDisbursed: number
//   confirmation?: number;
// }


// An action stores very little data directly.
// Instead, it has an 'events' subcollection
// which is a record of all the state changes
// that have happened to the collection.
export type BaseActionData = { timestamp: DateTime; initialId: string}
export type ActionTypes = {
  Buy: {
    initial: {
      amount: Decimal;
      type: "etransfer"|"deposit"|"other";
    }
  } & BaseActionData;
  Sell: { initial: CertifiedTransfer } & BaseActionData;
  Bill: { initial: CertifiedTransfer } & BaseActionData;
}
export type ActionType = keyof ActionTypes;

// A structure encompassing all the data related to an action
// Includes both root document and stream documents
export interface BaseAction {
  // Initial data stored in DB. Has no processing applied.
  data: BaseActionData,
  // Transitions that have been applied to this action.
  history: TransitionDelta[],
  // The firestore document that data came from
  doc: DocumentReference,
}
export interface TypedAction<Type extends ActionType> extends BaseAction {
  data: ActionTypes[Type];
}
export type SellAction = TypedAction<'Sell'>;
export type BuyAction = TypedAction<'Buy'>;
export type BillAction = TypedAction<'Bill'>;
